export default (sequelize, Sequelize) => {
    const Chat = sequelize.define("chat", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        is_group: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        }  
    });
    return Chat;
};