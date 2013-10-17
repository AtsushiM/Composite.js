describe('Compositeは', function() {
    var composite;

    beforeEach(function() {
        // init
        composite = new Composite();
    });
    afterEach(function() {
        // clear
        if (composite.dispose) {
            composite.dispose();
        }
    });

    it('.extend(prop)でクラスを作成する', function() {
        var initcount = 0,
            method1count = 0,
            Test = Composite.extend({
                init: function(num) {
                    initcount += num;
                },
                method1: function() {
                    method1count++;
                }
            }),
            test = new Test(1);

        expect(initcount).to.be(1);
        test.method1();
        expect(method1count).to.be(1);
        test.method1();
        expect(method1count).to.be(2);
    });

    it('initは省略できる', function() {
        var method1count = 0,
            Test = Composite.extend({
                method1: function() {
                    method1count++;
                }
            }),
            test = new Test(1);

        test.method1();
        expect(method1count).to.be(1);
        test.method1();
        expect(method1count).to.be(2);
    });

    it('extend()で作成したクラスはextend()を持つ', function() {
        var method1count = 0,
            method2count = 0,
            method3count = 0,
            Test1 = Composite.extend({
                method1: function() {
                    method1count += 1;
                },
                method2: function() {
                    method2count += 1;
                },
                method3: function() {
                    method3count += 1;
                }
            }),
            Test2 = Test1.extend({
                method1: function() {
                    method1count += 2;
                },
                method2: function() {
                    method2count += 2;
                    this._super();
                }
            }),
            test2 = new Test2();

        test2.method1();
        test2.method2();
        test2.method3();

        expect(method1count).to.be(2);
        expect(method2count).to.be(3);
        expect(method3count).to.be(1);
    });
    it('dispose()でプロパティとメソッドを破棄し、メモリーを解放する', function() {
        // composite.test1 = 1;
        // composite.test2 = '2';
        // composite.test3 = {};
        // composite.test4 = function() {};
        /* composite.dispose(); */
        // expect(composite).to.eql({});
        // expect(composite.dispose).to.be(undefined);
    });

    it('on()でイベントを登録する', function() {
        var count = 0,
            dammy = function() {
                count++;
            };

        composite.on('test', dammy);
        composite.on('test', dammy);
        composite.on('test1', function() {
            count += 3;
        });

        composite.emit('test');
        expect(count).to.be(2);

        composite.emit('test1');
        expect(count).to.be(5);
    });

    it('one()で一度のみ発火するイベントを登録する', function() {
        var count = 0,
            args = {
                one: function() {
                    count++;
                }
            };

        composite.one('one', args.one);
        composite.emit('one');
        composite.emit('one');

        expect(count).to.be(1);

        composite.one('one', args.one);
        composite.off('one', args.one);
        composite.emit('one');

        expect(count).to.be(1);
    });

    it('off()でイベントを削除する', function() {
        var count = 0,
            dammy1 = function() {
                count++;
            };

        composite.on('test', dammy1);
        composite.off('test');

        composite.emit('test');

        expect(count).to.be(0);
    });

    it('emit()でイベントを発火する', function() {
        var ret1 = 0,
            dammy1 = function() {
                ret1++;
            },
            ret2 = 0,
            dammy2 = function() {
                ret2++;
            };

        composite.on('test1', dammy1);
        composite.on('test2', dammy2);

        composite.emit('test1');

        expect(ret1).to.be(1);
        expect(ret2).to.be(0);

        composite.emit('test2');

        expect(ret1).to.be(1);
        expect(ret2).to.be(1);

        composite.on('test1', dammy2);

        composite.emit('test1');

        expect(ret1).to.be(2);
        expect(ret2).to.be(2);

        composite.emit('test2');

        expect(ret1).to.be(2);
        expect(ret2).to.be(3);

        composite.on('test3', function(arg1, arg2, arg3, ev) {
            expect(ev).to.be.a('object');
            expect(arg1).to.be(1);
            expect(arg2).to.be(2);
            expect(arg3).to.be(3);
        });

        composite.emit('test3', 1, 2, 3);
    });

    it('bubble()はemitのエイリアスである', function() {
        expect(composite.emit).to.be(composite.bubble);
    });

    it('addChild(instance)はCompositeのインスタンスを子供として登録する。', function() {
        var ret = [],
            child1 = new Composite,
            child2 = new Composite;

        composite.addChild(child1);
        child1.addChild(child2);

        composite.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(0);
        });
        child1.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(1);
        });
        child2.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(2);
        });

        child2.emit('test', 123);

        expect(ret).to.eql([2, 1, 0]);
    });

    it('capture()は親から子にイベントを伝播する', function() {
        var ret = [],
            child1 = new Composite,
            child2 = new Composite;

        composite.addChild(child1);
        child1.addChild(child2);

        composite.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(0);
        });
        child1.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(1);
        });
        child2.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(2);
        });

        composite.capture('test', 123);

        expect(ret).to.eql([0, 1, 2]);
    });

    it('removeChild([instance])は子供を削除する。instanceを省略した場合、すべての子供を削除する。', function() {
        var ret = [],
            child1 = new Composite,
            child2 = new Composite;

        composite.addChild(child1);
        child1.addChild(child2);

        composite.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(0);
        });
        child1.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(1);
        });
        child2.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(2);
        });

        composite.removeChild(child1);

        child2.emit('test', 123);

        expect(ret).to.eql([2, 1]);

        child1.removeChild();
        child2.emit('test', 123);

        expect(ret).to.eql([2, 1, 2]);
    });

    it('only()は親、子にイベントを伝播せず実行する', function() {
        var ret = [],
            child1 = new Composite,
            child2 = new Composite;

        composite.addChild(child1);
        child1.addChild(child2);

        composite.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(0);
        });
        child1.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(1);
        });
        child2.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(2);
        });

        child2.only('test', 123);

        expect(ret).to.eql([2]);
    });

    it('on(event, func)で登録したfuncの引数の最後に追加して渡される値はeventオブジェクトである。', function() {
        var ret = [],
            child1 = new Composite,
            child2 = new Composite;

        composite.addChild(child1);
        child1.addChild(child2);

        composite.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(0);
        });
        composite.on('test', function(num, ev) {
            ev.preventDefault();
            ret.push(1);
        });
        child1.on('test', function(num) {
            expect(num).to.be(123);
            ret.push(2);
        });
        child2.on('test', function(num, ev) {
            ev.stopPropagation();

            expect(num).to.be(123);
            ret.push(3);
        });
        child2.on('test', function(num, ev) {
            ev.stopPropagation();

            expect(num).to.be(123);
            ret.push(4);
        });

        child2.emit('test', 123);
        expect(ret).to.eql([4, 3]);

        ret = [];

        composite.capture('test', 123);
        expect(ret).to.eql([1, 2, 4, 3]);
    });
});
