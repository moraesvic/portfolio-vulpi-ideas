class A {
	fn1() {
		console.log('fn1!!');
	}

	fn2() {
		this.fn1();
	}
}

let a = new A();
a.fn1();
a.fn2();