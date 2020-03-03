var _ = require('lodash');
var Promise = require('bluebird');
var sqlite = require('sqlite');
// TODO probably want to use dev db on server
const dbPromise = sqlite.open('barker_database.db', { Promise });

exports.dbPromise = dbPromise;


async function initialize_db () {
    const models = require('./models.js').models;
	const db = await dbPromise;
    return Promise.all(_.map(models, (def) => {
        var sql = `CREATE TABLE ${def.table_name} (\n`;
        var col_sql = _.map(_.initial(def.schema.columns), (column) => {
            return `    ${column.name} ${_.upperCase(column.type)},`;   
        });
        var last_column = _.last(def.schema.columns);
        col_sql.push(`    ${last_column.name} ${_.upperCase(last_column.type)}`);
        sql += _.join(col_sql, '\n')
        sql += '\n);';
		return db.run(sql);
    }));
};
exports.initialize_db = initialize_db;
