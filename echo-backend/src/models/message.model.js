export default (sequelize, Sequelize) => {
    const Message = sequelize.define("message", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        chat_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'chats',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        sender_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'

        },
        recipient_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'

        },
        content: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        delivered: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },

        delivered_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        isRead: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        }
    });
    return Message;
};