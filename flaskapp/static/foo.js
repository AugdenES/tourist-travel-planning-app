for (let level = 1.7; level < 10; level+=0.3) {
    console.log(level)
}

function doo() {
    you = 2;
}
function foo() {
    boo(you)
}
function boo(you) {
    console.log(you)
}
doo()
foo()

let coo;
function loo() {
    coo = 4;
    console.log(coo)
}
loo()


let example = (String(2)+',').repeat(3)
console.log(example)