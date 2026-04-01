const jwt = require('jsonwebtoken');

const verificarToken = (req,res,next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if(!token){
		return res.status(403).json({error:'acceso denegado, no hay token'});
	}
	jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro', (err, usuarioDecodificado) => {
		if(err){
			return res.status(401).json({error:'Token invalido o expirado'});
		}
		req.usuario = usuarioDecodificado;
		next();
	});
};
module.exports = {verificarToken};
