const convenios = require('../db_apis/convenios.js');
const { jsPDF } = require("jspdf");
require('jspdf-autotable');

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
    id_unidad_gestora: parseInt(req.body.id_unidad_gestora, 10),
    id_coordinador_externo: parseInt(req.body.id_coordinador_externo, 10),
    id_coordinador_interno: parseInt(req.body.id_coordinador_interno, 10),
    nombre_conv: req.body.nombre_conv,
    tipo_conv: req.body.tipo_conv,
    movilidad: req.body.movilidad,
    vigencia: req.body.vigencia,
    ano_firma: parseInt(req.body.ano_firma, 10),
    tipo_firma: req.body.tipo_firma,
    cupos: parseInt(req.body.cupos, 10),
    documentos: req.body.documentos,
    condicion_renovacion: req.body.condicion_renovacion,
    estatus: req.body.estatus,
    fecha_inicio: req.body.fecha_inicio,
    fecha_termino: req.body.fecha_termino  
  };

  return datos;
}


async function post(req, res, next) {
  try {
    let datos = getDatosFromReq(req);
    console.log("datos EN POST");
    console.log(datos);
    datos = await convenios.create(datos);
    console.log("datos DESPUES DE CREATE");
    console.log(datos);
    res.status(201).json(datos);
  } catch (err) {
    next(err);
  }
}

function getDatosFromReqForUpdate(req) {
  const datos = {
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


async function criteriosReporte(req, res, next){
  try{
    const criteria = req.body;
    console.log(criteria);
    const result =  await convenios.seleccionCriterios(criteria);

    console.log('ROWS: ', result.rows)
    res.status(200).json(result.rows);
  }catch(err){
    next(err);
  }
}


async function generarInformePDF(req, res, next) {
  try {
    const convenios = req.body;

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();
    const dateTimeString = `${formattedDate} ${formattedTime}`;

    // Crea un nuevo documento PDF
    const pdfDoc = new jsPDF({
      orientation: 'landscape', // 'portrait' para orientación vertical
      unit: 'mm',
      format: 'legal',
    });

    // Agrega el encabezado al PDF
    pdfDoc.setFontSize(18);
    pdfDoc.text('Informe de Convenios', pdfDoc.internal.pageSize.width / 2, 20, { align: 'center' });

    pdfDoc.setFontSize(12);
    pdfDoc.text(`Fecha y hora de generación: ${dateTimeString}`, 20, 30);

    // Construye una matriz para la tabla
    const tableData = [
      ['ID', 'Nombre', 'Tipo', 'Movilidad', 'Vigencia', 'Año de Firma', 'Tipo de Firma', 'Cupos', 'Documentos', 'Condicion de Renovación', 'Estado', 'Fecha de inicio', 'Fecha de termino']
    ];

    // Agrega cada convenio a la matriz
    convenios.forEach(convenio => {
      const row = [
        convenio.ID_CONVENIO,
        convenio.NOMBRE_CONV,
        convenio.TIPO_CONV,
        convenio.MOVILIDAD,
        convenio.VIGENCIA,
        convenio.ANO_FIRMA,
        convenio.TIPO_FIRMA,
        convenio.CUPOS,
        convenio.DOCUMENTOS,
        convenio.CONDICION_RENOVACION,
        convenio.ESTATUS,
        convenio.FECHA_INICIO,
        convenio.FECHA_TERMINO
      ];
      tableData.push(row);
    });

    const columnStyles = {
      0: { cellWidth: 10 }, // ID
      1: { cellWidth: 50 }, // Nombre
      2: { cellWidth: 25 }, // Tipo
      3: { cellWidth: 20 }, // Movilidad
      4: { cellWidth: 20 }, // Vigencia
      5: { cellWidth: 20 }, // Año de Firma
      6: { cellWidth: 20 }, // Tipo de Firma
      7: { cellWidth: 20 }, // Cupos
      8: { cellWidth: 40 }, // Documentos
      9: { cellWidth: 30 }, // Condicion de Renovación
      10: { cellWidth: 20 }, // Estado
      11: { cellWidth: 20 }, // Fecha de inicio
      12: { cellWidth: 20 } // Fecha de termino

    };

    // Agrega la tabla al PDF
    pdfDoc.autoTable({
      head: [tableData[0]],
      body: tableData.slice(1),
      startY: 40,
      theme: 'grid',
      columnStyles,
    });

    // Guarda o descarga el archivo PDF
    const pdfBytes = pdfDoc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=informe.pdf');
    res.status(200).send(Buffer.from(pdfBytes));

  } catch (error) {
    // Manejo de errores
    console.error(error);
    next(error);
    res.status(500).send('Error generando el informe PDF');
  }
}
module.exports.generarInformePDF = generarInformePDF;

module.exports.get = get;
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;
module.exports.criteriosReporte = criteriosReporte;