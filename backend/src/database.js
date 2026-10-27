let pool;
export async function database(){
  if(!process.env.DB_USER||!process.env.DB_NAME)throw new Error('MySQL no configurado');
  if(!pool){const mysql=await import('mysql2/promise');pool=mysql.createPool({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME,waitForConnections:true,connectionLimit:5,decimalNumbers:true,dateStrings:true,timezone:'Z',connectTimeout:3000});}
  return pool;
}
export const configured=()=>Boolean(process.env.DB_USER&&process.env.DB_NAME);
export async function closeDatabase(){if(pool){await pool.end();pool=undefined;}}
