exports.models = [
    {
        table_name:  'users',
        obj_type: 'user',
		primary_key: 'user_id',
        schema: {
            columns: [
                {
                    name: 'user_id',
                    type: 'text primary key',
                    desc: 'primary key',
                },
                {
                    name: 'name',
                    type: 'text',
                    desc: 'the user specified name of the user',
                },
                {
                    name: 'email',
                    type: 'text',
                    desc: 'the user specified email of the user',
                },
                {
                    name: 'hidden',
                    type: 'integer default 0',
                    desc: 'whether the account is active',
                },
            ],
        },
    },
    {
        table_name:  'raws',
        obj_type: 'raw',
		primary_key: 'uuid',
        schema: {
            columns: [
                {
                    name: 'uuid',
                    type: 'text primary key',
                    desc: 'uuid is both the primary key for the object in the database, as well as the filename in the bucket',
                },
                {
                    name: 'user_id',
                    type: 'text',
                    desc: 'the foreign key to the user object',
                },
                {
                    name: 'name',
                    type: 'text',
                    desc: 'the user specified name displayed in the app',
                },
                {
                    name: 'bucket_url',
                    type: 'text',
                    desc: 'the full url of the audio file in the bucket',
                },
                {
                    name: 'bucket_fp',
                    type: 'text',
                    desc: 'the relative path (to bucket root) of the audio file in the bucket',
                },
                {
                    name: 'stream_url',
                    type: 'text',
                    desc: 'the generated stream url (this is generated by the backend as needed)',
                },
                {
                    name: 'hidden',
                    type: 'integer default 0',
                    desc: 'set to 1 if the user has "deleted" this object',
                },
            ],
        },
    },
    {
        table_name:  'songs',
        obj_type: 'song',
		primary_key: 'id',
        schema: {
            columns: [
                {
                    name: 'id',
                    type: 'integer primary key',
                    desc: 'the primary key',
                },
                {
                    name: 'name',
                    type: 'text',
                    desc: 'the name of the song (like "Happy Birthday" or "Sweet Child O\' Mine")',
                },
                {
                    name: 'bucket_url',
                    type: 'text',
                    desc: 'the full url of the midi file in the bucket',
                },
                {
                    name: 'bucket_fp',
                    type: 'text',
                    desc: 'the relative path (to bucket root) of the midi file in the bucket',
                },
                {
                    name: 'track_count',
                    type: 'integer',
                    desc: 'number of tracks on the midi file, which means you need that many crops to generate a sequence',
                },
                {
                    name: 'price',
                    type: 'real',
                    desc: 'in app purchase price for song',
                },
                {
                    name: 'category',
                    type: 'text',
                    desc: 'genre / type of song',
                },
                {
                    name: 'song_family',
                    type: 'text',
                    desc: 'the phylum of the song, like a version of happy birthday say',
                },
            ],
        },
    },
    {
        table_name:  'backing_tracks',
        obj_type: 'backing_track',
		primary_key: 'uuid',
        schema: {
            columns: [
                {
                    name: 'uuid',
                    type: 'text primary key',
                    desc: 'uuid is both the primary key for the object in the database, as well as the filename in the bucket',
                },
                {
                    name: 'name',
                    type: 'text',
                    desc: 'the user specified name displayed in the app',
                },
                {
                    name: 'song_id',
                    type: 'integer',
                    desc: 'the song that this backing track goes to',
                },
                {
                    name: 'bucket_url',
                    type: 'text',
                    desc: 'the full url of the audio file in the bucket',
                },
                {
                    name: 'bucket_fp',
                    type: 'text',
                    desc: 'the relative path (to bucket root) of the audio file in the bucket',
                },
                {
                    name: 'stream_url',
                    type: 'text',
                    desc: 'the generated stream url (this is generated by the backend as needed)',
                },
                {
                    name: 'hidden',
                    type: 'integer default 0',
                    desc: 'set to 1 if the user has "deleted" this object',
                },
            ],
        },
    },
    {
        table_name:  'images',
        obj_type: 'image',
		primary_key: 'uuid',
        schema: {
            columns: [
                {
                    name: 'uuid',
                    type: 'text primary key',
                    desc: 'uuid is both the primary key for the object in the database, as well as the filename in the bucket',
                },
                {
                    name: 'bucket_url',
                    type: 'text',
                    desc: 'the full url of the audio file in the bucket',
                },
                {
                    name: 'bucket_fp',
                    type: 'text',
                    desc: 'the relative path (to bucket root) of the audio file in the bucket',
                },
                {
                    name: 'user_id',
                    type: 'text',
                    desc: 'the foreign key to the user object',
                },
                {
                    name: 'name',
                    type: 'text',
                    desc: 'the user specified name of the image',
                },
                {
                    name: 'mouth_coordinates',
                    type: 'text',
                    desc: 'a string like [(x1, y1), (x2, y2), ...] storing the coordinates of landmarks on the image',
                },
                {
                    name: 'hidden',
                    type: 'integer default 0',
                    desc: 'whether the account is active',
                },
            ],
        },
    },
    {
        table_name:  'crops',
        obj_type: 'crop',
		primary_key: 'uuid',
        schema: {
            columns: [
                {
                    name: 'uuid',
                    type: 'text primart key',
                    desc: 'uuid is both the primary key for the object in the database, as well as the filename in the bucket',
                },
                {
                    name: 'raw_id',
                    type: 'text',
                    desc: 'the foreign key to the raw object the crop was generated from',
                },
                {
                    name: 'user_id',
                    type: 'text',
                    desc: 'the foreign key to the user object',
                },
                {
                    name: 'name',
                    type: 'text',
                    desc: 'the user specified name displayed in the app',
                },
                {
                    name: 'bucket_url',
                    type: 'text',
                    desc: 'the full url of the audio file in the bucket',
                },
                {
                    name: 'bucket_fp',
                    type: 'text',
                    desc: 'the relative path (to bucket root) of the audio file in the bucket',
                },
                {
                    name: 'stream_url',
                    type: 'text',
                    desc: 'the generated stream url (this is generated by the backend as needed)',
                },
                {
                    name: 'hidden',
                    type: 'integer default 0',
                    desc: 'set to 1 if the user has "deleted" this object',
                },
            ],
        },
    },
    {
        table_name:  'sequences',
        obj_type: 'sequence',
		primary_key: 'uuid',
        schema: {
            columns: [
                {
                    name: 'uuid',
                    type: 'text primary key',
                    desc: 'uuid is both the primary key for the object in the database, as well as the filename in the bucket',
                },
                {
                    name: 'song_id',
                    type: 'text',
                    desc: 'the foreign key to the song object the sequence was generated from',
                },
                {
                    name: 'crop_id',
                    type: 'text',
                    desc: 'the foreign key to the crop object the sequence was generated from',
                },
                {
                    name: 'user_id',
                    type: 'text',
                    desc: 'the foreign key to the user object',
                },
                {
                    name: 'name',
                    type: 'text',
                    desc: 'the user specified name displayed in the app',
                },
                {
                    name: 'bucket_url',
                    type: 'text',
                    desc: 'the full url of the audio file in the bucket',
                },
                {
                    name: 'bucket_fp',
                    type: 'text',
                    desc: 'the relative path (to bucket root) of the audio file in the bucket',
                },
                {
                    name: 'stream_url',
                    type: 'text',
                    desc: 'the generated stream url (this is generated by the backend as needed)',
                },
                {
                    name: 'hidden',
                    type: 'integer default 0',
                    desc: 'set to 1 if the user has "deleted" this object',
                },
            ],
        },
    },
];
