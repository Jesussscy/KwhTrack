# Guía de estratos de Cartagena

La sección **Tarifas y fuentes** permite escoger un estrato y consultar energía, agua y alcantarillado, aseo, predial y clasificación del inmueble. La selección no modifica el estrato oficial ni el precio de energía configurado. Los otros servicios no se suman al inventario energético.

## Fuentes y alcance de la revisión

Revisión documental: **19 de octubre de 2026**. Los enlaces se consultan por separado; una página disponible no acredita que todos sus documentos tarifarios estén actualizados o hayan sido extraídos.

| Fuente | Uso en la guía | Límite de la verificación |
| --- | --- | --- |
| [Asignación de estrato, Secretaría de Planeación](https://cartagena.gov.co/tramites-y-servicios/asignacion-estrato) | Clasificación de inmuebles residenciales y orientación hacia el trámite competente. | Ficha consultada, con fecha de actualización 07/09/2026. El portal no recibe solicitudes ni documentos. |
| [Ley 142 de 1994, Función Pública](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=2752) | Enlace al marco general de servicios públicos. | La extracción directa del texto no estuvo disponible; no se usa como tabla consolidada de porcentajes vigentes. |
| [Superservicios, Concepto 745 de 2021](https://normograma.superservicios.gov.co/NORMOGRAMA/compilacion/docs/concepto_superservicios_0000745_2021.htm) | Tratamiento residencial general de energía por estrato. | Orientación general con fecha, no certificación de subsidio ni liquidación del periodo actual. |
| [Afinia, tarifas y subsidios](https://afinia.com.co/inicio/tarifas-y-subsidios) | Ruta al prestador para consultar el precio del periodo. | No se verificó una tabla vigente. Se conserva el precio del hogar sin aplicar factores adicionales. |
| [Aguas de Cartagena, Tarifas](https://www.acuacar.com/Tarifas/) | Ruta oficial a documentos del prestador. | Portal consultado; no se extrajo una tabla mensual vigente ni se atribuyen porcentajes locales actuales. |
| [CRA, Concepto 19911 de 2026](https://normas.cra.gov.co/gestor/docs/concepto_cra_0019911_2026.htm) | Explicación de topes nacionales, aportes mínimos y competencias de los concejos en agua, alcantarillado y aseo. | Concepto jurídico orientativo. Los topes y mínimos no se presentan como factores confirmados de Cartagena. |
| [Veolia, publicación de tarifas de enero de 2024](https://www.cartagena.veolia.co/sites/g/files/dvc3146/files/document/2024/02/720%20Actaulizado%202024%20%281%29_0.pdf) | Ejemplo histórico interactivo por estrato y condición ocupado/desocupado. | Se consultó el PDF de una página. Los valores ya incluyen el factor publicado. Ámbito continental; la nota del PDF excluye zona insular salvo Barú, Ararca y Santa Ana. No se afirma vigencia actual. |
| [Decreto 0810 de 2023, Estatuto Tributario de Cartagena](https://www.cartagena.gov.co/sites/default/files/2024-03/DECRETO%200810%20DE%2009%20DE%20JUNIO%20DE%202023%20-%20ESTATUTO%20TRIBUTARIO.pdf) | Enlace de referencia para consultar el impuesto predial y modificaciones aplicables. | La consulta directa fue bloqueada; no se extrajeron tarifas por mil ni se implementó una liquidación tributaria. |
| [Calendario tributario de Cartagena 2026](https://www.cartagena.gov.co/noticias/alcaldia-cartagena-define-el-calendario-tributario-2026-descuentos-hasta-el-20%25-el-impuesto-predial-vigencia-actual) | Ruta para revisar vigencia, condiciones y plazos. | Publicación localizada en el índice; no se promete un descuento disponible ni se copian plazos sin revisión de la liquidación oficial. |

## Decisiones de implementación

- La guía no aplica porcentajes de un servicio a otro ni recalcula automáticamente la factura eléctrica por estrato.
- La explicación de agua identifica expresamente **máximo legal** y **mínimo legal**; el factor local requiere consultar el documento del periodo.
- El ejemplo de aseo presenta los importes finales transcritos del documento histórico, con dos decimales. No reconstruye toda la factura multiplicándola por un porcentaje.
- No se realiza una liquidación del predial con solo el estrato. Se orienta a la base aplicable, uso, vigencia y liquidación oficial.
- El estrato seleccionado se conserva durante la navegación actual de la guía, pero no se guarda como certificación o dato de cuenta. No se solicitan documentos, direcciones ni referencias catastrales.
- La guía usa reglas documentales locales; no consulta ni transmite datos a las entidades al cambiar de servicio o estrato. Solo los enlaces externos abren sus sitios.

## Mantenimiento

Los textos, fuentes y la transcripción histórica están en `frontend/tariff-guide.js`. Antes de incorporar una tabla vigente, verificar servicio, prestador, ámbito territorial, fechas, componentes y modificaciones. Una tabla nueva debe conservar su periodo y no reutilizar la etiqueta histórica como si fuera actual.

Las pruebas de `backend/test/tariff-guide.test.js` verifican los seis estratos y los cinco temas, los límites de entradas y la transcripción histórica. La revisión visual verifica además los cambios de controles y enlaces en la interfaz.
