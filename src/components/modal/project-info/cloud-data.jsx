const PropTypes = require('prop-types');
const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const intlShape = require('react-intl').intlShape;
const Modal = require('../base/modal.jsx');

require('../../forms/button.scss');
require('./modal.scss');

const CloudDataModal = ({
    intl,
    onRequestClose,
    ...modalProps
}) => (
    <Modal
        useStandardSizes
        className="mod-report"
        contentLabel={intl.formatMessage({id: 'projectInfo.cloudDataModal.title'})}
        overlayClassName="no-overlay"
        onRequestClose={onRequestClose}
        {...modalProps}
    >
        <div>
            { /* <div className="report-modal-header">
                <div className="report-content-label">
                    <FormattedMessage id="projectInfo.cloudDataModal.title" />
                </div>
            </div> */
            }

            <div className="report-modal-content">
                <div>
                    <div className="instructions">
                        <FormattedMessage id="projectInfo.cloudDataModal.body" />
                    </div>
                </div>
            </div>
        </div>
    </Modal>
);


CloudDataModal.propTypes = {
    intl: intlShape,
    onDelete: PropTypes.func,
    onReport: PropTypes.func,
    onRequestClose: PropTypes.func
};

module.exports = injectIntl(CloudDataModal);
