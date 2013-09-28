(function() {
  module("assembler bitwriter");
  
  test("ensure bitwriter append works", function() {
    // arrange
    var writer = new yasp.BitWriter();
    
    // act
    writer.append(0xFF, 8);
    
    // assert
    strictEqual(writer.bits, "11111111");
  });
  
  test("ensure bitwriter touint8array works", function() {
    // arrange
    var writer = new yasp.BitWriter();
    var array;
    
    // act
    writer.append(0xFF, 8);
    array = writer.toUint8Array();
    
    // assert
    strictEqual(array[0], 0xFF);
  });
  
  test("ensure bitwriter normalizing works", function() {
    // arrange
    var writer = new yasp.BitWriter();
    var array;

    // act
    writer.append(0xFF, 4);
    array = writer.toUint8Array();

    // assert
    strictEqual(array[0], 0xF0);
  });
})();