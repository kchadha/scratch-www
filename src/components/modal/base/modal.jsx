const bindAll = require('lodash.bindall');
const classNames = require('classnames');
const omit = require('lodash.omit');
const PropTypes = require('prop-types');
const React = require('react');
const ReactModal = require('react-modal');

require('./modal.scss');

ReactModal.setAppElement(document.getElementById('app'));

/**
 * Container for pop up windows (See: registration window)
 */
class Modal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleRequestClose'
        ]);
    }
    handleRequestClose () {
        return this.modal.portal.requestClose();
    }
    render () {
        // bodyOpenClassName prop cannot be blank string or null here; both cause
        // an error, because ReactModal does not correctly handle them.
        // If we're not setting it to a class name, we must omit the prop entirely.
        const bodyOpenClassNameProp = this.props.useStandardSizes ?
            {bodyOpenClassName: classNames('overflow-hidden')} : {};

        const overlayClassName = this.props.overlayClassName ? this.props.overlayClassName : 'modal-overlay-default';
        return (
            <ReactModal
                appElement={document.getElementById('app')}
                {...bodyOpenClassNameProp}
                className={{
                    base: classNames('modal-content', this.props.className, {
                        'modal-sizes': this.props.useStandardSizes
                    }),
                    afterOpen: classNames('modal-content', this.props.className),
                    beforeClose: classNames('modal-content', this.props.className)
                }}
                overlayClassName={{
                    base: classNames('modal-overlay', overlayClassName),
                    afterOpen: classNames('modal-overlay', overlayClassName),
                    beforeClose: classNames('modal-overlay', overlayClassName)
                }}
                ref={component => {
                    this.modal = component;
                }}
                {...omit(this.props, ['className', 'overlayClassName'])}
            >
                <div
                    className="modal-content-close"
                    onClick={this.handleRequestClose}
                >
                    <img
                        alt="close-icon"
                        className="modal-content-close-img"
                        src="/svgs/modal/close-x.svg"
                    />
                </div>
                {this.props.children}
            </ReactModal>
        );
    }
}

Modal.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    overlayClassName: PropTypes.string,
    useStandardSizes: PropTypes.bool
};

module.exports = Modal;
