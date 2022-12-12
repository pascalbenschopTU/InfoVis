function rijksdriehoek(λ, φ) {
  // Coordinates of origin (Amersfoort)
  var x0 = 155000.0;
  var y0 = 463000.0;
  var φ0 = 52.15517440;
  var λ0 =  5.38720621;
  var R = [
    {"p":0, "q":1, "R": 190094.945},
    {"p":1, "q":1, "R": -11832.228},
    {"p":2, "q":1, "R": -114.221},
    {"p":0, "q":3, "R": -32.391},
    {"p":1, "q":0, "R": -0.705},
    {"p":3, "q":1, "R": -2.340},
    {"p":1, "q":3, "R": -0.608},
    {"p":0, "q":2, "R": -0.008},
    {"p":2, "q":3, "R": 0.148}]
  var S = [
    {"p":1, "q":0, "S": 309056.544},
    {"p":0, "q":2, "S": 3638.893},
    {"p":2, "q":0, "S": 73.077},
    {"p":1, "q":2, "S": -157.984},
    {"p":3, "q":0, "S": 59.788},
    {"p":0, "q":1, "S": 0.433},
    {"p":2, "q":2, "S": -6.439},
    {"p":1, "q":1, "S": -0.032},
    {"p":0, "q":4, "S": 0.092},
    {"p":1, "q":4, "S": -0.054}]
  var dφ = 0.36*(φ - φ0);
  var dλ = 0.36*(λ - λ0);
  var x = x0;
  for (var i = 0; i < R.length; ++i) {
    var p = R[i].p;
    var q = R[i].q;
    var r = R[i].R;
    x += r*Math.pow(dφ, p)*Math.pow(dλ, q);
  }
  var y = y0;
  for (var i = 0; i < S.length; ++i) {
    var p = S[i].p;
    var q = S[i].q;
    var s = S[i].S;
    y += s*Math.pow(dφ, p)*Math.pow(dλ, q);
  }
  return [x, y];
}

// Convert UTM coordinates to Wgs
// Zone for Netherlands is 31
function Utm2Wgs( X,Y,zone) {
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