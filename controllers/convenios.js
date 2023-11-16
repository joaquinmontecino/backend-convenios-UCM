const convenios = require('../db_apis/convenios.js');



async function get(req, res, next) {
  try {
    const target = {};
 
    target.id = Number(req.params.id);

    const rows = await convenios.find(target);

    if (req.params.id) {
      if (rows.length === 1) {
        res.status(200).json(rows[0]);
      } else {
        res.status(404).end();
      }
    } else {
      res.status(200).json(rows);
    }
  } catch (err) {
    next(err);
  }
}



function getDatosFromReq(req) {
  const datos = {
    id_institucion: req.body.id_institucion,
    id_coordinador: req.body.id_coordinador,
    nombre_conv: req.body.nombre_conv,
    tipo_conv: req.body.tipo_conv,
    vigencia: req.body.vigencia,
    ano_firma: req.body.ano_firma,
    tipo_firma: req.body.tipo_firma,
    cupos: req.body.cupos,
    documentos: req.body.documentos      
  };

  return datos;
}


async function post(req, res, next) {
  try {
    let datos = getDatosFromReq(req);

    datos = await convenios.create(datos);

    res.status(201).json(datos);
  } catch (err) {
    next(err);
  }
}




async function put(req, res, next) {
  try {
    let convenio = getDatosFromReq(req);

    convenio.id_convenio = parseInt(req.params.id, 10);

    convenio = await convenios.update(convenio);       

    if (convenio !== null) {
      res.status(200).json(convenio);               
    } else {
      res.status(404).end();                        
    }
  } catch (err) {
    next(err);
  }
}
  

async function del(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    const success = await convenios.delete(id);

    if (success) {
      res.status(204).end();
    } else {
      res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
}
  




module.exports.get = get;
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;