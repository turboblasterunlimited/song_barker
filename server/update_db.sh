node -e "require('./database.js').update_db();"
# call python fixtures script
#cd ../audio_processing
#source .env/bin/activate
#echo "populating fixtures..."
#python populate_fixtures.py
echo "done"