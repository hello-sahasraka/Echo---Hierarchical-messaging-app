export default (sequelize, Sequelize) => {
    const Participant = sequelize.define("participant", {
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
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'

        },
        role: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        joined_at: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: Sequelize.NOW,
        }
    });
    return Participant;
};