function Vector2  (x, y) {
    this.x = x;
    this.y = y;
}

Vector2.prototype = {
    copy: function () {
        return new Vector2(this.x, this.y);
    },
    length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    sqrLength: function () {
        return this.x * this.x + this.y * this.y;
    },
    normalize: function () {
        var inv = 1 / this.length();
        return new Vector2(this.x * inv, this.y * inv);
    },
    negate: function () {
        return new Vector2(-this.x, -this.y);
    },
    add: function (v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    },
    subtract: function (v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    },
    multiply: function (f) {
        return new Vector2(this.x * f, this.y * f);
    },
    divide: function (f) {
        var invf = 1 / f;
        return new Vector2(this.x * invf, this.y * invf);
    },
    dot: function (v) {
        return this.x * v.x + this.y * v.y;
    }
};

function getRBC(n, weights, ctlPs, umin, umax, nPoints) {
    var result = [];
    for(let i=0;i<nPoints-1;i++){
        let temp = RBCfunc(n,weights,ctlPs,umin+(umax-umin)*i/(nPoints-1));
        result.push(temp.x);
        result.push(temp.y);
        result.push(0);
    }
    result.push(ctlPs[n-1].x);
    result.push(ctlPs[n-1].y);
    result.push(0);
    // console.log(result)
    return result;
}


function RBCfunc(n, weights, ctlPs, t) {
    var result = new Vector2(0, 0);

    let totalW = 0;
    if (weights instanceof Array && ctlPs instanceof Array) {
        for (i = 0; i < n; i++) {
            let weight = bernsteinBase(i, n-1, t) * weights[i];
            // console.log("weight: ",weight)
            totalW += weight;
            result = result.add(ctlPs[i].multiply(weight));
            // console.log("result: ",result.x,result.y);
        }
        return result.divide(totalW);
    }
    console.error("non array weights and contrl points");
    return Vector2(0, 0);

}


function bernsteinBase(i, n, t) {
    return Math.pow(t, i) * Math.pow(1 - t, n - i) * combination(n, i);
}

//自定义组合函数(就是数学排列组合里的C)
function combination(m, n) {
    return factorial(m, n) / factorial(n, n);//就是Cmn(上面是n，下面是m) = Amn(上面是n，下面是m)/Ann(上下都是n)
}


//自定义排列函数(就是数学排列组合里的A)
function array(m, n) {
    return factorial(m, n);//就是数学里的Amn,上面是n，下面是m
}


//自定义一个阶乘函数，就是有n个数相乘，从m开始，每个数减1，如factorial(5,4)就是5*(5-1)*(5-2)*(5-3),相乘的数有4个
function factorial(m, n) {
    var num = 1;
    var count = 0;
    for (var i = m; i > 0; i--) {
        if (count == n) {//当循环次数等于指定的相乘个数时，即跳出for循环
            break;
        }
        num = num * i;
        count++;
    }
    return num;
}


