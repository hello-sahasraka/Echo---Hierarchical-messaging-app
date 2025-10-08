export default (sequelize, Sequelize) => {
    const Participant = sequelize.define("participant", {
        Chat_id: {
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
        joined_at: {
            type: Sequelize.DATE,
            allowNull: true,
        }
    });
    return Participant;
};