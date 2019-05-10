
Function.prototype.myCall = function(content = window, ...args) {
    content.fn = this;
    let res = content.fn(...args);
    delete content.fn;
    return res;
};

Function.prototype.myApply = function (content = window, args) {
    content.fn = this;
    let res = content.fn(...args)
    delete content.fn;
    return res
}

Function.prototype.myBind = function (content, ...args) {
    const self = this
    return function (...args2) {
        self.apply(content, args.concat(args2))
    }
}