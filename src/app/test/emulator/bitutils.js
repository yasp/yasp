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
    var actual = bitutils.extractBits(params.byte, params.part);
    deepEqual(actual, expected);
  });
})();
