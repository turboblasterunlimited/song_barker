var _ = require('lodash');
//var sqlite = require('sqlite-sync');
//var DB_FILENAME = 'barker_database.db';
//var db = {
//  cursor: sqlite.connect(DB_FILENAME),
//};
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');

var table_defs = [
    {
        table_name:  'users',
        obj_type: 'user',
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
            ],
        },
    },
    {
        table_name:  'pets',
        obj_type: 'pet',
        schema: {
            columns: [
                {
                    name: 'pet_id',
                    type: 'integer primary key autoincrement',
                    desc: 'primary key',
                },
                {
                    name: 'name',
                    type: 'text',
                    desc: 'the user specified name of the pet displayed in the app',
                },
                {
                    name: 'image_url',
                    type: 'text',
                    desc: 'the full url of the image file in the bucket',
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
        table_name:  'raws',
        obj_type: 'raw',
        schema: {
            columns: [
                {
                    name: 'uuid',
                    type: 'text',
                    desc: 'uuid is both the primary key for the object in the database, as well as the filename in the bucket',
                },
                {
                    name: 'pet_fk',
                    type: 'text',
                    desc: 'the foreign key to the pet object the raw audio was recorded from',
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
        table_name:  'crops',
        obj_type: 'crop',
        schema: {
            columns: [
                {
                    name: 'uuid',
                    type: 'text',
                    desc: 'uuid is both the primary key for the object in the database, as well as the filename in the bucket',
                },
                {
                    name: 'raw_fk',
                    type: 'text',
                    desc: 'the foreign key to the raw object the crop was generated from',
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
        schema: {
            columns: [
                {
                    name: 'uuid',
                    type: 'text',
                    desc: 'uuid is both the primary key for the object in the database, as well as the filename in the bucket',
                },
                {
                    name: 'crop_fk',
                    type: 'text',
                    desc: 'the foreign key to the crop object the sequence was generated from',
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

function initialize_db (table_defs) {
    //db.cursor = sqlite.connect(DB_FILENAME);
    _.each(table_defs, (def) => {
        var sql = `CREATE TABLE ${def.table_name} (\n`;
        var col_sql = _.map(_.initial(def.schema.columns), (column) => {
            return `    ${column.name} ${_.upperCase(column.type)},`;   
        });
        var last_column = _.last(def.schema.columns);
        col_sql.push(`    ${last_column.name} ${_.upperCase(last_column.type)}`);
        sql += _.join(col_sql, '\n')
        sql += '\n);';
        //console.log(sql);
        // execute
    })
};

initialize_db(table_defs);



function default_params (params, defaults) {
    for (var key in defaults) {
        if (defaults.hasOwnProperty(key)) {
            params[key] = (params[key] ? params : defaults)[key];
        }
    }
}

//  default_params(params, {
//      client_id: 'default-id',
//      uuid: 'default-uuid',
//      name: 'default-name',
//        pet_id: null,
//      url: null,
//      stream_url: null,
//  });
//  return db.cursor.insert('raw', params);


function obj_to_sql (obj) {
    var keys = _.keys(obj);

    var cols = '(\n';
    cols += _.join(_.map(_.initial(keys), (key) => {
        return `    ${key}, \n`;
    }), '');
    cols += `    ${_.last(keys)}\n)`;

    var placeholders = '(\n';
    placeholders += _.join(_.map(_.initial(keys), (key) => {
        return `    :${key}, \n`;
    }), '');
    placeholders += `    :${_.last(keys)}\n)`;

    return {
        columns: cols,
        placeholders: placeholders,
    };
}



//function insert_sql (table_name, obj) {
//  var sql = `INSERT INTO ${table name} (\n`;
//  name) VALUES?)
//
//}

function obj_rest_api (def) {
    // generate rest endpoints for an object
    return {
        get: {
            endpoint: def.obj_type,
            handler:  (req, res) => {
                var sql = `SELECT * from ${def.table_name}\n`;
                sql += `    where ${def.primary_key} = ${req.body[def.primary_key]};`;
                console.log(sql);
            },
        },
        post: {
            endpoint: def.obj_type,
            handler:  (req, res) => {
                var sql_obj = obj_to_sql(req.body);
                var sql = `INSERT INTO ${def.table_name} ${sql_obj.columns} VALUES ${sql_obj.placeholders};`
                console.log(sql);
            },
        },
        put: {
            endpoint: def.obj_type,
            handler:  (req, res) => {
                var columns = _.keys(req.body);
                var sql = `UPDATE ${def.table_name} SET\n`
                sql += _.join(_.map(_.initial(columns), (column) => {
                    return `    ${column} = ':${column}',\n`;
                }), '');
                sql += `    ${_.last(columns)} = :${_.last(columns)}\n`;
                //${sql_obj.columns} VALUES ${sql_obj.placeholders};`
                sql += `WHERE ${def.primary_key} = ${req.body[def.primary_key]};`
                console.log(sql);
            },
        },
        delete: {
            endpoint: def.obj_type,
            handler:  (req, res) => {
                var sql = `UPDATE ${def.table_name}\n`;
                sql += `    set hidden = 1 where ${def.primary_key} = ${req.body[def.primary_key]};`;
                console.log(sql);
            },
        },
    };
}

sample_obj = {
    sample: 'fuck you',
    hehe: 123,
};

var api = obj_rest_api({
    table_name: 'sample_table',
    primary_key: 'sample',
});
api.get.handler({body: sample_obj});






//// create one
//app.post('/obj-type', (req, res) => {
//  return res.send('Received a POST HTTP method');
//});
//// read one
//app.get('/obj-type/:uuid', (req, res) => {
//  return res.send('Received a GET HTTP method');
//});
//// update one
//app.put('/obj-type/:uuid', (req, res) => {
//  return res.send('Received a PUT HTTP method');
//});
//// delete one
//app.delete('/obj-type/:uuid', (req, res) => {
//  return res.send('Received a DELETE HTTP method');
//});
//
//// read all
//app.get('/obj-type', (req, res) => {
//  return res.send('Received a GET HTTP method');
//});
