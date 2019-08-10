
const React = require('react');

const r = require('r-dom');

const forwardRef = () => Component => React.forwardRef((props, ref) => r(Component, {
	...props,
	__forwardedRef: ref,
}));

const unforwardRef = () => Component => ({ __forwardedRef, ...props }) => r(Component, {
	...props,
	ref: __forwardedRef,
});

module.exports = {
	forwardRef,
	unforwardRef,
};
