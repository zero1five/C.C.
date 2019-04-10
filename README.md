# C.C.
#### 一门函数式语言。
<p>基础语法与Haskell相似。</p>
<p>支持Monad、模式匹配、惰性求值、类型系统。</p>
<p>精准的数值运算。</p>

由Javascript作为底层实现。

## Install
```bash
$ npm install flcc -g
```

## Uasge
```javascript

let displayText = "I'm C.C."

print(displayText); // I'm C.C.

/* I'm C.C. a little lang */
printStr("I'm C.C. %s", "a little lang") 

const getLength = vector => {
  case (vector) {
    when { x: 1, y: 2, z: 3 } -> {
      print('first case passed.');
    }
    when { x: 1, y: 2 } -> {
      print('second case passed.');
    }
  }
}

getLength({x: 1, y: 2, z: 3}); // first case passed.
getLength({x: 1, y: 2}); // second case passed.

```