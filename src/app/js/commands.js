if (typeof yasp == 'undefined') yasp = { };

yasp.commands = [
    {
        "name": "MOV",
        "description": "This is an awesome MOV command yolo",
        "code": [
            {
                "value": 42,
                "length": 8
            },
            {
                "value": 1337,
                "length": 8
            }
        ],
        "params": [
            {
                "type": "r_byte"
            },
            {
                "type": "pin"
            }
        ]
    },
    {
        "name": "PUSH",
        "description": "This is an awesome PUSH command yolo",
        "code": [
            {
                "value": 42,
                "length": 8
            },
            {
                "value": 1337,
                "length": 8
            }
        ],
        "params": [
            {
                "type": "r_byte"
            },
            {
                "type": "pin"
            }
        ]
    },
    {
        "name": "POP",
        "description": "This is an awesome POP command yolo",
        "code": [
            {
                "value": 42,
                "length": 8
            },
            {
                "value": 1337,
                "length": 8
            }
        ],
        "params": [
            {
                "type": "r_byte"
            },
            {
                "type": "pin"
            }
        ]
    },
    {
        "name": "ADD",
        "description": "This is an awesome ADD command yolo",
        "code": [
            {
                "value": 42,
                "length": 8
            },
            {
                "value": 1337,
                "length": 8
            }
        ],
        "params": [
            {
                "type": "r_byte"
            },
            {
                "type": "pin"
            }
        ]
    },
    {
        "name": "SUB",
        "description": "This is an awesome SUB command yolo",
        "code": [
            {
                "value": 42,
                "length": 8
            },
            {
                "value": 1337,
                "length": 8
            }
        ],
        "params": [
            {
                "type": "r_byte"
            },
            {
                "type": "pin"
            }
        ]
    }
]