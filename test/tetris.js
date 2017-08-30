import assert from 'assert';
import Grid,{Tile, Tetris, buildMatrix} from '../src/Grid';

let getTransformMatrix = (i)=>{
    let matrixs = [null];

    matrixs.push([
            [
            "100",
            "111"
            ],
            [
            "11",
            "10",
            "10"
            ],
            [
            "111",
            "001"
            ],
            [
            "01",
            "01",
            "11"
            ]
    ]);

    matrixs.push([
            [
            "001",
            "111"
            ],
            [
            "10",
            "10",
            "11"
            ],
            [
            "111",
            "100"
            ],
            [
            "11",
            "01",
            "01"
            ]
    ]);

    

    matrixs.push([
            [
            "110",
            "011"
            ],
            [
            "01",
            "11",
            "10"
            ],
            [
            "110",
            "011"
            ],
            [
            "01",
            "11",
            "10"
            ]
    ]);

    matrixs.push([
            [
            "011",
            "110"
            ],
            [
            "10",
            "11",
            "01"
            ],
            [
            "011",
            "110"
            ],
            [
            "10",
            "11",
            "01"
            ]
    ]);

    matrixs.push([
            [
            "111",
            "010"
            ],
            [
            "01",
            "11",
            "01"
            ],
            [
            "010",
            "111"
            ],
            [
            "10",
            "11",
            "10"
            ]
    ]);

    matrixs.push([
        [
        "1",
        "1",
        "1",
        "1"
        ],
        [
        "1111"
        ],
        [
            "1",
            "1",
            "1",
            "1"
        ],
        [
            "1111"
        ]
    ]);

    return matrixs[i];
};

describe('Tetris Turning Test', function() {
   let compare = (tetris, matrix)=>{
        if(tetris.length != matrix.length || tetris[0].length != matrix[0].length){
            return false;
        }
        for(let i=0; i < tetris.length; i++){
            for(let j=0; j < tetris[i].length; j++){
                if(tetris[i][j] != matrix[i][j]) return false;
            }
        }
        return true;
    }

    it("Turn Clockwise", function(){
        for(let i=1; i < Tetris.shapeCount(); i++){
            let tetris = new Tetris(Tetris.shape(i));
            let matrixs = getTransformMatrix(i);
            let j = 0;
            do{
                assert.equal(compare(tetris.data, matrixs[j%4]), true, "test shape:"+i+" turn clockwise "+(j%4*90));
                tetris.turn(true);
                j++;
            }while(j<8)
        }
    });

    it("Turn AntiClockwise", function(){
        for(let i=1; i < Tetris.shapeCount(); i++){
            let tetris = new Tetris(Tetris.shape(i));
            let matrixs = getTransformMatrix(i);
            let j = 0;
            do{
                assert.equal(compare(tetris.data, matrixs[(4-(j%4))%4]), true, "test shape:"+i+" turn anticlockwise "+(j%4*-90));
                tetris.turn(false);
                j++;
            }while(j<8)
        }
    });
});