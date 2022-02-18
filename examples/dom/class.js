// 定义了 dom 样式操作方法，包括判断是否存在指定的样式、添加样式、移除样式、切换样式
export const hasClass = function(obj, cls) {
  return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
};

export const addClass = function(obj, cls) {
  if (!hasClass(obj, cls)) obj.className += ' ' + cls;
};

export const removeClass = function(obj, cls) {
  if (hasClass(obj, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
    obj.className = obj.className.replace(reg, ' ');
  }
};

export const toggleClass = function(obj, cls) {
  if (hasClass(obj, cls)) {
    removeClass(obj, cls);
  } else {
    addClass(obj, cls);
  }
};
