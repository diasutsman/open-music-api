const amqp = require('amqplib');
const config = require('../../utils/config');

const ProducerService = {
  async sendMessage(queue, message) {
    const connection = await amqp.connect(config.rabbitMq.host);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ProducerService;
