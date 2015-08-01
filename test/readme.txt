一、单元测试用例开发指南：
往test目录中添加一个名为test.js的测试文件，代码如下：

require("should");

var name = "zhaojian";

describe("Name", function() {
    it("The name should be zhaojian", function() {
        name.should.eql("zhaojian");
    });
});

var Person = function(name) {
    this.name = name;
};
var zhaojian = new Person(name);

describe("InstanceOf", function() {
    it("Zhaojian should be an instance of Person", function() {
        zhaojian.should.be.an.instanceof(Person);
    });

    it("Zhaojian should be an instance of Object", function() {
        zhaojian.should.be.an.instanceof(Object);
    });
});
describe("Property", function() {
    it("Zhaojian should have property name", function() {
        zhaojian.should.have.property("name");
    });
});

