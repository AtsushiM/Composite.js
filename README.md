# Composite.js
HTML要素の様にイベントを伝播するオブザーバーを実現するライブラリ。


[![Build Status](https://travis-ci.org/AtsushiM/Composite.js.png?branch=master)](https://travis-ci.org/AtsushiM/Composite.js)


## Usage
### Compositeインスタンスを作成する
```javascript
var composite = new Composite;
```

### インスタンスにイベントを登録する
```javascript
composite.on('event-name', function(e, arg) {
    // write code.
});
```

### インスタンスに一度だけ実行されるイベントを登録する
```javascript
var eventaction = function(e, arg) {
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
composite.emit('event-name', arg, function() {
    // callback.
});
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
// composite.emit === composite.bubble

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
composite_child.on('event-propagation', function(e) {
    e.stopPropagation();
});
composite_parent.on('event-propagation', function(e) {
    // don't execute.
});
composite_child.emit('event-propagation');
```

### 実行中のイベント以前に同じイベントに登録された関数の実行を停止する
```javascript
composite.on('event-default', function(e) {
    // don't execute.
});
composite.on('event-default', function(e) {
    e.preventDefault();
});
composite.emit('event-default');
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
