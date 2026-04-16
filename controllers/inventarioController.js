const {writePool,redisClient} = require('../config/db'); 

const registrarMovimiento = async (req,res) => {
	const {sku,cantidad,tipo_movimiento,motivo} = req.body;
	const usuario_id = req.usuario.id;
	const client = await writePool.connect();

	try{
		await client.query('BEGIN');	
		const  resProducto = await client.query('SELECT id, stock FROM productos WHERE sku = $1', [sku]);
		if(resProducto.rows.length === 0){
			throw new Error('Producto no encontrado');
		}
		const producto = resProducto.rows[0];

    		// Paso B: Calcular el nuevo stock con matemáticas simples
    		let nuevoStock = producto.stock;
    		if (tipo_movimiento === 'ENTRADA') {
      			nuevoStock += cantidad;
    		} else if (tipo_movimiento === 'SALIDA') {
      			nuevoStock -= cantidad;
    		} else {
     	 		throw new Error('Tipo de movimiento inválido (debe ser ENTRADA o SALIDA)');
    		}

		// Validación de negocio: No podemos tener stock negativo
    		if (nuevoStock < 0) {
      			throw new Error(`Stock insuficiente. Stock actual: ${producto.stock}`);
    		}

    		// Paso C: Actualizar el stock en la tabla productos
    		await client.query(
      			'UPDATE productos SET stock = $1, actualizado_en = CURRENT_TIMESTAMP WHERE id = $2', 
      			[nuevoStock, producto.id]
    		);

    		// Paso D: Dejar la huella en el historial_inventario
    		await client.query(
      			`INSERT INTO historial_inventario 
      			(producto_id, usuario_id, tipo_movimiento, cantidad, stock_resultante, motivo) 
      			VALUES ($1, $2, $3, $4, $5, $6)`,
      			[producto.id, usuario_id, tipo_movimiento, cantidad, nuevoStock, motivo]
    		);

		// === FIN DE LA ZONA BLINDADA ===
    		await client.query('COMMIT'); // ¡Todo salió perfecto! Guardar en disco.

    		// Paso E: ¡La regla de oro de Redis!
    		// Como el dato en Postgres cambió, el caché ahora es basura/viejo. Lo borramos.
    		// La próxima vez que alguien haga un GET, Node lo volverá a buscar a Postgres y guardará el dato fresco.
    		await redisClient.del(`producto:${sku}`);
    		console.log(`🧹 Caché invalidado para el producto ${sku}`);
		res.json({
			mensaje:'movimiento registrado con exito',
			nuevo_stock:nuevoStock
		});
	}catch(error){
		await client.query('ROLLBACK');
		console.error('error en la transaccion, haciendo roolback',error.message)
		res.status(400).json({error:error.message || 'Error interno al procesar el movimiento'});
	}finally{
		//pase lo que pase, se debe de devolver la conexion al pool para no saturar el servidor
		client.release();
	}
};
module.exports = {registrarMovimiento};
//EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEeee 
