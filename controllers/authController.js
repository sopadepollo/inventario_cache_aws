const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const {pool} = require('../config/db');

const registro = async (req,res) => {
	if(!req.body || !req.body.email || !req.body.password || !req.body.rol_id){
		return res.status(400).json({
			error: 'Faltan campos obligatorios, debe tener email, password y rol_id'
		});
	}
	const {email, password, rol_id} = req.body;
	try{
		const saltRounds = 10;
		const passwordHash = await bcrypt.hash(password,saltRounds);
		const result = await pool.query(
			'INSERT INTO usuarios (email,password_hash,rol_id) VALUES ($1,$2,$3) RETURNING id, email',
			[email,passwordHash,rol_id]
		);
		res.status(201).json({
			mensaje:'Usuario creado',
			usuario:result.rows[0]
		});
	}catch(error){
		console.error(error);
		//el error 23505 en postgres significa Violacion de llave unica.
		if(error.code === '23505'){
			return res.status(409).json({error:'el email ya esta registrado'});
		}
		res.status(500).json({error: 'error interno del servidor al registro de usuario'})
	}
};

const login = async (req,res) => {
	const {email,password} = req.body;
	try{
		const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
		if(result.rows.length === 0){
			return res.status(401).json({error:'Credenciales invalidas'});
		}
		const usuario = result.rows[0];
		const passwordValida = await bcrypt.compare(password,usuario.password_hash);
		if(!passwordValida){
			return res.status(401).json({error:'Credenciales invalidas'});
		}
		const token = jwt.sign(
			{id: usuario.id, rol_id: usuario.rol_id},
			process.env.JWT_SECRET || 'secreto_super_seguro',
			{expiresIn: '2h'}
		);
		res.json({mensaje: 'Login exitoso',token});
	}catch(error){
		console.error(error);
		res.status(500).json({error:'Error en el servidor'});
	}
};
module.exports = {registro, login};
