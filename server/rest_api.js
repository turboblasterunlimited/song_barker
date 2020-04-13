var _ = require('lodash');
var Promise = require('bluebird');
var sqlite = require('sqlite');
const dbPromise = require('./database.js').dbPromise;


function error_wrapper (fn) {
    return async (req, res) => {
        try {
            return await fn(req, res);
        } catch (err) {
            return res.status(500).send(`[rest api error] ${err}`)
        }
    };
}


function obj_rest_api (def, db) {
    // generate rest endpoints for an object
	// TODO make sure primary keys are immutable
    // TODO refactor for sql injection at some point...
    // TODO return objects for POST PUT and DELETE
    var rest_api = {
        get_all: {
			request_method: 'get',
            endpoint: `/all/${def.obj_type}` + (def.user_owned ? `/:user_id` : ''),
            handler: async (req, res) => {
                var sql = `SELECT * from ${def.table_name}\n`;
                if (def.user_owned) {
                    sql += `    where user_id = "${req.params.user_id}"\n`;
                }
                if (def.order_by) {
                    sql += `    order by ${def.order_by} ASC\n`;
                }
                sql += ';'
                var rows = await db.all(sql);
                _.each(rows, (row) => {
                    row.obj_type = def.obj_type;
                });
                return res.json(rows);
            },
        },
        get: {
			request_method: 'get',
            endpoint: `/${def.obj_type}/:primary_key`,
            handler: async (req, res) => {
                var sql = `SELECT * from ${def.table_name}\n`;
                sql += `    where ${def.primary_key} = "${req.params.primary_key}";`;
                //console.log(sql);
				var row = await db.get(sql);
                row.obj_type = def.obj_type;
				return res.json(row);
            },
        },
        post: {
			request_method: 'post',
            endpoint: `/${def.obj_type}`,
            handler: async (req, res) => {
                var sql_obj = obj_to_sql(req.body);
                var sql = `INSERT INTO ${def.table_name} ${sql_obj.columns} VALUES ${sql_obj.placeholders};`
				var db_response = await db.run(sql, prefix_obj(req.body));
				var row = await db.get(`SELECT * from ${def.table_name} where rowid = "${db_response.lastID}";`);
                row.obj_type = def.obj_type;
				return res.json(row);
            },
        },
        patch: {
			request_method: 'patch',
            endpoint: `/${def.obj_type}/:primary_key`,
            handler:  async (req, res) => {
                var columns = _.keys(req.body);
                var sql = `UPDATE ${def.table_name} SET\n`
                sql += _.join(_.map(_.initial(columns), (column) => {
                    return `    ${column} = $${column},\n`;
                }), '');
                sql += `    ${_.last(columns)} = $${_.last(columns)}\n`;
                //${sql_obj.columns} VALUES ${sql_obj.placeholders};`
                sql += `WHERE ${def.primary_key} = "${req.params.primary_key}";`
				var db_response = await db.run(sql, prefix_obj(req.body));
				var row = await db.get(`SELECT * from ${def.table_name} where ${def.primary_key} = "${req.params.primary_key}";`);
                row.obj_type = def.obj_type;
				return res.json(row);
            },
        },
        delete: {
			request_method: 'delete',
            endpoint: `/${def.obj_type}/:primary_key`,
            handler:  async (req, res) => {
                var sql = `UPDATE ${def.table_name}\n`;
                sql += `    set hidden = 1 where ${def.primary_key} = "${req.params.primary_key}";`;
				var db_response = await db.run(sql);
				var row = await db.get(`SELECT * from ${def.table_name} where ${def.primary_key} = "${req.params.primary_key}";`);
                row.obj_type = def.obj_type;
				return res.json(row);
            },
        },
    };
    _.each(rest_api, (api) => {
        api.handler = error_wrapper(api.handler);
    });
    return rest_api;
}
exports.obj_rest_api = obj_rest_api;


function obj_to_sql (obj) {
    var keys = _.keys(obj);

    var cols = '(\n';
    cols += _.join(_.map(_.initial(keys), (key) => {
        return `    ${key}, \n`;
    }), '');
    cols += `    ${_.last(keys)}\n)`;

    var placeholders = '(\n';
    placeholders += _.join(_.map(_.initial(keys), (key) => {
        return `    $${key}, \n`;
    }), '');
    placeholders += `    $${_.last(keys)}\n)`;

    return {
        columns: cols,
        placeholders: placeholders,
    };
}


function prefix_obj (obj) {
	return _.fromPairs(_.map(_.toPairs(obj), (pair) => {
		return ['$' + pair[0], pair[1]];
	}));
}


