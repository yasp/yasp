(function () {
  var emulator;

  module("bitutils", {
    setup: function () {
    },
    teardown: function () {
    }
  });

  //
  var i = parseInt("01010101", 2);
  var extractBitsData = [
    {
      title: "1 byte, 1 part",
      byte: [ i ],
      part: [ 2 ],
      retn: [ 1 ]
    },
    {
      title: "1 byte, 2 parts",
      byte: [ i ],
      part: [ 2, 3 ],
      retn: [ 1, 2 ]
    },
    {
      title: "2 bytes, 1 part",
      byte: [ i, i ],
      part: [ 9 ],
      retn: [ 170 ]
    },
    {
      title: "3 bytes, 1 part",
      byte: [ i, i ],
      part: [ 17 ],
      retn: [ 43690 ]
    },
    {
      title: "2 bytes, 2 parts",
      byte: [ i, i ],
      part: [ 7, 2 ],
      retn: [ 42, 2 ]
    },
    {
      title: "2 bytes, 3 parts",
      byte: [ i, i ],
      part: [ 7, 2, 2 ],
      retn: [ 42, 2, 2 ]
    },
    {
      title: "3 bytes, 3 parts",
      byte: [ i, i, i ],
      part: [ 7, 2, 2, 8 ],
      retn: [ 42, 2, 2, 170 ]
    }
  ];

  QUnit.cases(extractBitsData).test("extractBits", function (params) {
    var expected = params.retn;
    var actual = new Array(params.part.length);
    yasp.bitutils.extractBits(params.byte, params.part, actual);
    deepEqual(actual, expected);
  });

  test("extractBits - speed", function () {
    var retn = new Array(extractBitsData[0].part.length);
    var byte = extractBitsData[0].byte;
    var part = extractBitsData[0].part;

    var num = 1000000;
    var start = +new Date();

    for (var j = 0; j < num; j++) {
      yasp.bitutils.extractBits(byte, part, retn);
    }

    var end = +new Date();
    var dur = (end - start);
    var hz = (1 / dur) * num;
    ok(true, ~~(hz / 1000) + "MHz");
  });
})();
