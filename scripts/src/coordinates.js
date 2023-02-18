// Convert UTM coordinates to Wgs
// Source: https://gis.stackexchange.com/questions/62281/converting-utm-decimal-degrees-with-javascript-or-using-a-web-service
// Zone for Netherlands is 31
function Utm2Wgs(X,Y,zone) {
  X = X - 500000;
  var sa = 6378137.000000;
  var sb = 6356752.314245;

  var e = Math.pow( Math.pow(sa , 2) - Math.pow(sb , 2) , 0.5 ) / sa;
  var e2 = Math.pow( Math.pow( sa , 2 ) - Math.pow( sb , 2 ) , 0.5 ) / sb;
  var e2cuadrada = Math.pow(e2 , 2);
  var c = Math.pow(sa , 2 ) / sb;



  var S = ( ( zone * 6 ) - 183 ); 
  var lat =  Y / ( 6366197.724 * 0.9996 );                         
  var v =  (c * 0.9996)/ Math.pow( 1 + ( e2cuadrada * Math.pow( Math.cos(lat), 2 ))  , 0.5 ) ;
  var a = X / v;
  var a1 = Math.sin( 2 * lat );
  var a2 = a1 * Math.pow( Math.cos(lat), 2);
  var j2 = lat + ( a1 / 2 );
  var j4 = ( ( 3 * j2 ) + a2 ) / 4;
  var j6 = ( ( 5 * j4 ) + ( a2 * Math.pow( Math.cos(lat) , 2) ) ) / 3;
  var alfa = ( 3 / 4 ) * e2cuadrada;
  var beta = ( 5 / 3 ) * Math.pow(alfa , 2);
  var gama = ( 35 / 27 ) * Math.pow(alfa , 3);
  var Bm = 0.9996 * c * ( lat - alfa * j2 + beta * j4 - gama * j6 );
  var b = ( Y - Bm ) / v;
  var Epsi = ( ( e2cuadrada * Math.pow(a , 2)) / 2 ) * Math.pow( Math.cos(lat) , 2);
  var Eps = a * ( 1 - ( Epsi / 3 ) );
  var nab = ( b * ( 1 - Epsi ) ) + lat;
  var senoheps = ( Math.exp(Eps) - Math.exp(-Eps) ) / 2;
  var Delt = Math.atan(senoheps / Math.cos(nab) );
  var TaO = Math.atan(Math.cos(Delt) * Math.tan(nab));
  var longitude = (Delt *(180 / Math.PI ) ) + S;
  var latitude = ( lat + ( 1 + e2cuadrada* Math.pow(Math.cos(lat), 2) - ( 3 / 2 ) * e2cuadrada * Math.sin(lat) * Math.cos(lat) * ( TaO - lat ) ) * ( TaO - lat ) ) * (180 / Math.PI);
  
  return [longitude, latitude];
}