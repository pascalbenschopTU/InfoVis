function rijksdriehoekToGeo(x, y) {
    // Coordinates of origin (Amersfoort)
    var x0 = 155000.0;
    var y0 = 463000.0;
    var φ0 = 52.15517440;
    var λ0 =  5.38720621;
    var K = [ 
      {"p":0, "q":1, "K":3235.65389}, 
      {"p":2, "q":0, "K": -32.58297}, 
      {"p":0, "q":2, "K":  -0.24750}, 
      {"p":2, "q":1, "K":  -0.84978}, 
      {"p":0, "q":3, "K":  -0.06550}, 
      {"p":2, "q":2, "K":  -0.01709}, 
      {"p":1, "q":0, "K":  -0.00738}, 
      {"p":4, "q":0, "K":   0.00530}, 
      {"p":2, "q":3, "K":  -0.00039}, 
      {"p":4, "q":1, "K":   0.00033}, 
      {"p":1, "q":1, "K":  -0.00012}];
    var L = [
      {"p":1, "q":0, "L":5260.52916}, 
      {"p":1, "q":1, "L": 105.94684}, 
      {"p":1, "q":2, "L":   2.45656}, 
      {"p":3, "q":0, "L":  -0.81885}, 
      {"p":1, "q":3, "L":   0.05594}, 
      {"p":3, "q":1, "L":  -0.05607}, 
      {"p":0, "q":1, "L":   0.01199}, 
      {"p":3, "q":2, "L":  -0.00256}, 
      {"p":1, "q":4, "L":   0.00128}];
    var dx = (x - x0)/1E5;
    var dy = (y - y0)/1E5;
    var φ = φ0;
    for (var i = 0; i < K.length; ++i) {
      var p = K[i].p;
      var q = K[i].q;
      var k = K[i].K;
      φ += k*Math.pow(dx, p)*Math.pow(dy, q)/3600;
    }
    var λ = λ0; 
    for (var i = 0; i < L.length; ++i) {
      var p = L[i].p;
      var q = L[i].q;
      var l = L[i].L;
      λ += l*Math.pow(dx, p)*Math.pow(dy, q)/3600;
    }
    return [φ, λ];
  };

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