import numpy as np
import tempfile
import scipy.io.wavfile as wavfile
import sqlite3
import uuid
import subprocess as sp
import glob
import warnings
import os
import logger
import bucket_client
import argparse
import time
import db_queries as dbq
import audio_conversion as ac


THRESHOLD = 300000 # min sum of abs value of all pcm samples

log = logger.log_fn(os.path.basename(__file__)) 


def to_crops (raw_uuid, user_id, image_id, debug=False):
    log(raw_uuid, 'starting...')

    try:
        dbq.db_insert('raws', uuid=raw_uuid, user_id=user_id)
    except:
        pass

    crop_uuids = []
    bucket_crop_paths = []

    with tempfile.TemporaryDirectory() as tmp_dir:

        # get the raw input file
        remote_fp = os.path.join(raw_uuid, 'raw.aac')
        local_fp_aac = os.path.join(tmp_dir, 'raw.aac')
        bucket_client.download_filename_from_bucket(remote_fp, local_fp_aac)

        # convert to wav
        local_fp_wav = ac.aac_to_wav(local_fp_aac)

        # split with sox
        split_cmd = 'sox {in_fp} {out_fp_prefix} silence 1 0.3 0.001% 1 0.1 1% : newfile : restart'
        split_args = {
            'in_fp': local_fp_wav,
            'out_fp_prefix': os.path.join(tmp_dir, 'crop_.wav'),
        }
        sp.call(split_cmd.format(**split_args), shell=True)

        # log initial split count
        result = sp.run('ls {} | wc -l'.format(os.path.join(tmp_dir, 'crop_*.wav')), 
                stdout=sp.PIPE, stderr=sp.PIPE, universal_newlines=True, shell=True)
        log(raw_uuid, 'initial split count {}'.format(
            result.stdout
        ))

        # filter crops that are too quiet
        # TODO normalize maybe?
        good_crops = []
        for crop_fp in glob.glob(os.path.join(tmp_dir, 'crop_*.wav')):
            samplerate, data = wavfile.read(crop_fp)
            if np.sum(abs(data)) > THRESHOLD:
                good_crops.append(crop_fp)
        log(raw_uuid, 'filtered split count {}'.format(
            len(good_crops)
        ))
        if debug:
            for crop in good_crops:
                sp.call('play {}'.format(crop), shell=True)
                keep_going = input()
                if keep_going != 'q':
                    continue
                else:
                    break

        crop_info = dbq.get_crop_defaults(user_id, image_id)

        # upload good crops and log in db
        for crop_fp_wav in good_crops:
            if debug:
                print(crop_fp_wav)
            crop_info['crop_count'] += 1
            crop_uuid = uuid.uuid4()
            crop_uuids.append(crop_uuid)

            # convert to aac
            crop_fp_aac = ac.wav_to_aac(crop_fp_wav)

            # upload to bucket
            bucket_filename = '{}.aac'.format(crop_uuid)
            bucket_fp = os.path.join(raw_uuid, 'cropped', bucket_filename)
            bucket_url = os.path.join('gs://', 'song_barker_sequences', bucket_fp)
            bucket_client.upload_filename_to_bucket(crop_fp_aac, bucket_fp)

            # this is just a placeholder for the user based on existing count of crops from a specific pet_id
            auto_name = '{} {}'.format(crop_info['base_name'], crop_info['crop_count'])
            if debug:
                print('auto name', auto_name)

            # record in db
            row = dbq.db_insert('crops', **{
                'uuid': str(crop_uuid),
                'raw_id': raw_uuid,
                'user_id': user_id, 
                'name': auto_name,
                'bucket_url': bucket_url,
                'bucket_fp': bucket_fp,
                'stream_url': None,
                'hidden': 0,
            })
            if debug:
                import pprint
                print(' *** debug output - result from insert *** ')
                pp = pprint.PrettyPrinter(indent=4)
                pp.pprint(row)
            bucket_crop_paths.append(bucket_url)

    # send to stdout for consumption by server
    for cuuid, cpath in zip(crop_uuids, bucket_crop_paths):
        print(cuuid, cpath)

    log(raw_uuid, 'finished')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--input-audio-uuid', '-i', help='audio file to be split')
    parser.add_argument('--user-id', '-u', help='user_id')
    parser.add_argument('--image-id', '-m', help='image_id')
    parser.add_argument('--debug', '-d', action='store_true', help='playback audio crops', default=False)
    args = parser.parse_args()

    if not args.debug:
        warnings.filterwarnings('ignore')

    # TODO maybe lint args?
    to_crops(args.input_audio_uuid, args.user_id, args.image_id, args.debug)