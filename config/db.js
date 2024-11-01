import config from './config.json' assert { type: 'json' };
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: 'mysql',
    timezone: '+03:00',
    logging: console.log,
});

export default sequelize;
