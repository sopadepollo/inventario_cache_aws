const {SQSClient, SendMessageCommand} = require("@aws-sdk/client-sqs");
const sqsClient = new SQSClient({region: process.env.AWS_REGION});

const enviarACola = async(accion, payload) => {
	try{
		const mensajeEnvuelto = {accion, payload};
		const params = {
			QueueUrl: process.env.SQS_QUEUE_URL,
			MessageBody: JSON.stringify(mensajeEnvuelto)
		};
		return await sqsClient.send(new SendMessageCommand(params));
	}catch(error){
		console.error(`[SQS Service] - Error al enviar la accion ${accion}:`, error);
		throw error;
	}
};
module.exports = {enviarACola};
