# Composite.js
HTML要素の様にイベントを伝播するオブザーバーを実現するライブラリ。


## Usage
### Compositeインスタンスを作成する
```javascript
var composite = new Composite;
```

### インスタンスにイベントを登録する
```javascript
composite.on('event-name', function(arg1, arg2, arg3) {
    // write code.
});
```

### インスタンスに一度だけ実行されるイベントを登録する
```javascript
var eventaction = function(arg1, arg2, arg3) {
        // write code.
    };
composite.one('event-name', eventaction);
```

### 登録されたイベントを解除する
```javascript
composite.off('event-name', eventaction);
```

### 登録されたイベントを全て解除する
```javascript
composite.off('event-name');
```

### インスタンスに登録されたイベントを実行する
```javascript
composite.fire('event-name', arg1, arg2, arg3);
```

### イベント伝播の対象を登録する
```javascript
var composite_parent = new Composite,
    composite_child = new Composite;

composite_parent.addChild(composite_child);
```

### イベント伝播の対象を解除する
```javascript
composite_parent.removeChild(composite_child);
```

### イベント伝播の対象を全て解除する
```javascript
composite_parent.removeChild();
```

### イベントをバブリングで実行する
```javascript
// composite.fire === composite.bubble

composite_child.on('event-bubble', function() {
    // call 1.
});
composite_parent.on('event-bubble', function() {
    // call 2.
});
composite_child.bubble('event-bubble');
```

### イベントをキャプチャリングで実行する
```javascript
composite_child.on('event-capture', function() {
    // call 2.
});
composite_parent.on('event-capture', function() {
    // call 1.
});
composite_parent.capture('event-capture');
```

### イベントの伝播を停止する
```javascript
composite_child.on('event-propagation', function(num1, num2, num3, e) {
    e.stopPropagation();
});
composite_parent.on('event-propagation', function(num1, num2, num3, e) {
    // don't execute.
});
composite_child.fire('event-propagation', 1, 2, 3);
```

### 実行中のイベント以前に同じイベントに登録された関数の実行を停止する
```javascript
composite.on('event-default', function(num, e) {
    // don't execute.
});
composite.on('event-default', function(num, e) {
    e.preventDefault();
});
composite.fire('event-default', 1);
```

### イベントを伝播させずに実行する
```javascript
composite_child.only('event-only');
```

### インスタンスを削除し、メモリを開放する
```javascript
composite.dispose();
```

### Compositeを継承する
```javascript
var ExtendComposite = Composite.extend({
        init: function(config) {
            // write init code.
        },
        method1: function() {
            // write method.
        },
        on: function() {
            // override method.

            // call super method.
            this._super.apply(this, arguments);
        },
    });
```

## More
このライブラリはCIR.jsのC.Ompositeを切り出したものです。

http://atsushim.github.io/cir.js/#Omposite
