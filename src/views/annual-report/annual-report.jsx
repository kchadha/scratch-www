const bindAll = require('lodash.bindall');
const classNames = require('classnames');
const React = require('react');
const MediaQuery = require('react-responsive').default;
const FormattedHTMLMessage = require('react-intl').FormattedHTMLMessage;
const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const intlShape = require('react-intl').intlShape;

const render = require('../../lib/render.jsx');
const frameless = require('../../lib/frameless');

const Avatar = require('../../components/avatar/avatar.jsx');
const Page = require('../../components/page/www/page.jsx');
const Grid = require('../../components/grid/grid.jsx');
const Button = require('../../components/forms/button.jsx');
const FlexRow = require('../../components/flex-row/flex-row.jsx');
const Comment = require('../../components/comment/comment.jsx');
const WorldMap = require('../../components/world-map/world-map.jsx');
const CountryUsage = require('./country-usage.json');
const PeopleGrid = require('../../components/people-grid/people-grid.jsx');
const People = require('./people.json');
const BLMProjects = require('./blm-projects.json');
const VideoPreview = require('../../components/video-preview/video-preview.jsx');

require('./annual-report.scss');

// Some constants used for the page subnav and section refs
const SECTIONS = {
    message: 'message',
    mission: 'mission',
    reach: 'reach',
    milestones: 'milestones',
    initiatives: 'initiatives',
    financials: 'financials',
    supporters: 'supporters',
    leadership: 'leadership',
    donate: 'donate'
};

const SECTION_NAMES = {
    message: <FormattedMessage id="annualReport.subnavMessage" />,
    mission: <FormattedMessage id="annualReport.subnavMission" />,
    reach: <FormattedMessage id="annualReport.subnavReach" />,
    milestones: <FormattedMessage id="annualReport.subnavMilestones" />,
    initiatives: <FormattedMessage id="annualReport.subnavInitiatives" />,
    financials: <FormattedMessage id="annualReport.subnavFinancials" />,
    supporters: <FormattedMessage id="annualReport.subnavSupporters" />,
    leadership: <FormattedMessage id="annualReport.subnavLeadership" />,
    donate: <FormattedMessage id="annualReport.subnavDonate" />
};

// Constants used for world map data processing/formatting for use with Plotly
const countryKeys = Object.keys(CountryUsage);
const countryNames = countryKeys.map(key => CountryUsage[key].display);
const countryData = countryKeys.map(key => CountryUsage[key].count);
const colorIndex = countryKeys.map(key => CountryUsage[key]['log count']);

class AnnualReport extends React.Component {
    constructor (props) {
        super(props);

        // Storage for each of the section refs when we need to refer
        // to them in the scroll handling code
        // These will be stored with a short lowercase key representing
        // the specific section (e.g. 'mission')
        this.sectionRefs = {};

        this.subnavRef = null;

        this.state = {
            currentlyVisible: SECTIONS.message, // The currently visible section
            dropdownVisible: false
        };

        bindAll(this, [
            'scrollTo',
            'setRef',
            'setSubnavRef',
            'handleSubnavItemClick',
            'getDimensionsOfSection',
            'handleScroll',
            'handleDropDownClick'
        ]);
    }

    componentDidMount () {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnMount () {
        window.removeEventListener('scroll', this.handleScroll);
    }

    // A generic handler for a subnav item that takes the name of the
    // section to scroll to (all lowercase)
    handleSubnavItemClick (sectionName) {
        // Return a button click handler that will close the dropdown if open
        // and scrolls to the correct section
        return () => {
            this.setState({dropdownVisible: false});
            this.scrollTo(this.sectionRefs[sectionName]);
        };
    }

    scrollTo (element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Generically create a ref for the given section, stored in
    // this.sectionRefs
    setRef (sectionName) {
        return ref => (this.sectionRefs[sectionName] = ref);
    }

    setSubnavRef (ref) {
        this.subnavRef = ref;
    }

    // Calculate the dimensions of a given section for use in figuring out
    // which section is currently visible
    getDimensionsOfSection (sectionRef) {
        const {height} = sectionRef.getBoundingClientRect();
        const offsetTop = sectionRef.offsetTop;
        const offsetBottom = offsetTop + height;

        return {
            height,
            offsetTop,
            offsetBottom
        };
    }

    // While scrolling, update the subnav to reflect the currently visible section
    handleScroll () {
        const subnavHeight = this.getDimensionsOfSection(this.subnavRef).height;
        // The additional 50 is to account for the main site nav height
        const currentScrollPosition = window.scrollY + subnavHeight + 50;

        // Find which section is currently visible based on our scroll position
        for (const key in this.sectionRefs) {
            if (!this.sectionRefs.hasOwnProperty(key)) continue;
            const currentRef = this.sectionRefs[key];
            const {offsetBottom, offsetTop} = this.getDimensionsOfSection(currentRef);
            if (currentScrollPosition > offsetTop && currentScrollPosition < offsetBottom) {
                if (this.state.currentlyVisible !== key) {
                    this.setState({currentlyVisible: key});
                    return;
                }
            }
        }
    }

    // Click handler for responsive subnav dropdown
    handleDropDownClick () {
        this.setState({dropdownVisible: !this.state.dropdownVisible});
    }

    render () {
        // Element containing buttons to scroll to each of the sections in the
        // annual report. The layout of this component will be different on
        // different screen sizes (see below)
        const subnav =
            (<FlexRow className="inner">
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.message}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.message)}
                >
                    {SECTION_NAMES.message}
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.mission}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.mission)}
                >
                    <FormattedMessage id="annualReport.subnavMission" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.milestones}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.milestones)}
                >
                    <FormattedMessage id="annualReport.subnavMilestones" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.reach}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.reach)}
                >
                    <FormattedMessage id="annualReport.subnavReach" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.initiatives}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.initiatives)}
                >
                    <FormattedMessage id="annualReport.subnavInitiatives" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.financials}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.financials)}
                >
                    <FormattedMessage id="annualReport.subnavFinancials" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.supporters}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.supporters)}
                >
                    <FormattedMessage id="annualReport.subnavSupporters" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.leadership}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.leadership)}
                >
                    <FormattedMessage id="annualReport.subnavLeadership" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.donate}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.donate)}
                >
                    <FormattedMessage id="annualReport.subnavDonate" />
                </a>
            </FlexRow>);

        return (
            <div>
                <div
                    className="subnavigation"
                    ref={this.setSubnavRef}
                >
                    {/* Top Bar */}
                    <MediaQuery maxWidth={frameless.tabletPortrait - 1}>
                        <div className="sectionIndicator inner" >
                            {SECTION_NAMES[this.state.currentlyVisible]}
                            <Button
                                className="dropdown-button"
                                onClick={this.handleDropDownClick}
                            >
                                <img
                                    className={classNames({rotated: this.state.dropdownVisible})}
                                    src="/images/annual-report/dropdown-arrow.svg"
                                />
                            </Button>
                        </div>
                        {this.state.dropdownVisible ?
                            /* Bottom Bar */
                            <div className="inner">
                                <hr />
                                {subnav}
                            </div> :
                            null
                        }
                    </MediaQuery>
                    {/* For large screens, show whole subnav, with no dropdown */}
                    <MediaQuery minWidth={frameless.tabletPortrait}>
                        {subnav}
                    </MediaQuery>
                </div>
                <div className="annual-report-content">
                    <div
                        className="message-section section"
                        ref={this.setRef(SECTIONS.message)}
                    >
                        <FlexRow className="masthead">
                            <div className="masthead-content">
                                <p className="message-year">
                                    <FormattedMessage id="annualReport.mastheadYear" />
                                </p>
                                <h1>
                                    <FormattedMessage id="annualReport.mastheadTitle" />
                                </h1>
                            </div>
                            <img src="/images/annual-report/message/hero-image.svg" />
                        </FlexRow>
                        <MediaQuery minWidth={frameless.desktop}>
                            <img
                                className="wave-icon-desktop"
                                src="/images/annual-report/message/wave-icon.svg"
                            />
                        </MediaQuery>
                        <div className="inner">
                            <FlexRow className="message-content">
                                <MediaQuery maxWidth={frameless.desktop - 1}>
                                    {/* Show the wave icon inside this div in smaller screens */}
                                    <div className="wave-icon-and-title">
                                        <img src="/images/annual-report/message/wave-icon.svg" />
                                        <h2>
                                            <FormattedMessage id="annualReport.messageTitle" />
                                        </h2>
                                    </div>
                                </MediaQuery>
                                <MediaQuery minWidth={frameless.desktop}>
                                    <h2>
                                        <FormattedMessage id="annualReport.messageTitle" />
                                    </h2>
                                </MediaQuery>
                                <div className="message-from-team">
                                    <p>
                                        <FormattedMessage id="annualReport.messageP1" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.messageP2" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.messageP3" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.messageP4" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.messageP5" />
                                    </p>
                                    <p className="message-signature">
                                        <FormattedMessage id="annualReport.messageSignature" />
                                    </p>
                                    <img
                                        className="team-photo"
                                        src="/images/annual-report/message/team-photo.svg"
                                    />
                                </div>
                            </FlexRow>
                        </div>
                        <div className="transition-images">
                            <img src="/images/annual-report/message/blocks.svg" />
                            <img src="/images/annual-report/message/banana.svg" />
                        </div>
                    </div>
                    <div className="covid-response-section inner">
                        <h2>
                            <FormattedMessage id="annualReport.covidResponseTitle" />
                        </h2>
                        <p>
                            <FormattedMessage id="annualReport.covidResponseP1" />
                        </p>
                        <p>
                            <FormattedMessage
                                id="annualReport.covidResponseP2"
                                values={{
                                    scratchAtHomeLink: (
                                        <a
                                            href="https://sip.scratch.mit.edu/scratchathome/"
                                            rel="noreferrer noopener"
                                            target="_blank"
                                        >
                                            <FormattedMessage id="annualReport.covidResponseScratchAtHomePage" />
                                        </a>
                                    )
                                }}
                            />
                        </p>
                        <p>
                            <FormattedMessage
                                id="annualReport.covidResponseP3"
                                values={{
                                    scratchCommunityLink: (
                                        <a
                                            href="/"
                                            rel="noreferrer noopener"
                                            target="_blank"
                                        >
                                            <FormattedMessage id="annualReport.covidResponseScratchCommunity" />
                                        </a>
                                    )
                                }}
                            />
                        </p>
                    </div>
                    <div
                        className="mission-section section"
                        ref={this.setRef(SECTIONS.mission)}
                    >
                        <div className="inner">
                            <h2><FormattedMessage id="annualReport.missionTitle" /></h2>
                            <p className="mission-subtitle"><FormattedMessage id="annualReport.missionSubtitle" /></p>
                            <p><FormattedMessage id="annualReport.missionP1" /></p>
                            <p><FormattedMessage id="annualReport.missionP2" /></p>
                            <p><FormattedMessage id="annualReport.missionP3" /></p>
                        </div>
                        <div className="four-ps-wrapper">
                            <div className="four-ps">
                                <div className="one-p four-ps-projects">
                                    <h3><FormattedMessage id="annualReport.missionProjectsTitle" /></h3>
                                    <p><FormattedMessage id="annualReport.missionProjectsDescription" /></p>
                                    <img src="/images/annual-report/mission/Projects Illustration.svg" />
                                </div>
                                <div className="one-p four-ps-peers">
                                    <h3><FormattedMessage id="annualReport.missionPeersTitle" /></h3>
                                    <p><FormattedMessage id="annualReport.missionPeersDescription" /></p>
                                    <img src="/images/annual-report/mission/Peers Illustration.svg" />
                                </div>
                                <div className="one-p four-ps-passion">
                                    <h3><FormattedMessage id="annualReport.missionPassionTitle" /></h3>
                                    <p><FormattedMessage id="annualReport.missionPassionDescription" /></p>
                                    <img src="/images/annual-report/mission/Passion Illustration.svg" />
                                </div>
                                <div className="one-p four-ps-play">
                                    <h3><FormattedMessage id="annualReport.missionPlayTitle" /></h3>
                                    <p><FormattedMessage id="annualReport.missionPlayDescription" /></p>
                                    <img src="/images/annual-report/mission/Play Illustration.svg" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="milestones-section section"
                        ref={this.setRef(SECTIONS.milestones)}
                    >
                        <div className="inner">
                            <div className="milestones-wrapper">
                                <div className="milestones-column left">
                                    <h2>
                                        <FormattedMessage id="annualReport.milestonesTitle" />
                                    </h2>
                                    <p className="milestones-description">
                                        <FormattedMessage id="annualReport.milestonesDescription" />
                                    </p>
                                    <MediaQuery minWidth={frameless.desktop}>
                                        <img
                                            className="single-image"
                                            src="/images/annual-report/milestones/timeline1.svg"
                                        />
                                    </MediaQuery>
                                </div>
                                <div className="milestones-column right">
                                    <div className="milestone-box first">
                                        <h4>
                                            2003
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2003Message" />
                                        </p>
                                    </div>
                                    <div className="milestone-box">
                                        <h4>
                                            2004
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2004Message" />
                                        </p>
                                        <img src="/images/annual-report/milestones/2004_Clubhouse.jpg" />
                                    </div>
                                    <div className="milestone-box last">
                                        <h4>
                                            2007
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2007Message" />
                                        </p>
                                        <img src="/images/annual-report/milestones/2007_EarlyScratch.png" />
                                    </div>
                                </div>
                            </div>
                            <MediaQuery minWidth={frameless.desktop}>
                                <img src="/images/annual-report/milestones/timeline_line_right.svg" />
                            </MediaQuery>
                            <div className="milestones-wrapper">
                                <div className="milestones-column left">
                                    <div className="milestone-box">
                                        <h4>
                                            2008
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2008Message" />
                                        </p>
                                        <img src="/images/annual-report/milestones/2008_Conference.jpg" />
                                    </div>
                                    <div className="milestone-box">
                                        <h4>
                                            2009
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2009Message1.4" />
                                        </p>
                                        <img src="/images/annual-report/milestones/2009_Scratch1_4.png" />
                                    </div>
                                    <div className="milestone-box">
                                        <h4>
                                            2009
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2009MessageScratchDay" />
                                        </p>
                                    </div>
                                    <div className="milestone-box">
                                        <h4>
                                            2010
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2010Message" />
                                        </p>
                                    </div>
                                </div>
                                <div className="milestones-column right">
                                    <MediaQuery minWidth={frameless.desktop}>
                                        <img
                                            className="single-image"
                                            src="/images/annual-report/milestones/timeline2.svg"
                                        />
                                    </MediaQuery>
                                </div>
                            </div>
                            <MediaQuery minWidth={frameless.desktop}>
                                <img src="/images/annual-report/milestones/timeline_line_left.svg" />
                            </MediaQuery>
                            <div className="milestones-wrapper">
                                <div className="milestones-column left">
                                    <MediaQuery minWidth={frameless.desktop}>
                                        <img
                                            className="single-image"
                                            src="/images/annual-report/milestones/timeline3.svg"
                                        />
                                    </MediaQuery>
                                </div>
                                <div className="milestones-column right">
                                    <div className="milestone-box">
                                        <h4>
                                            2013
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2013MessageFoundation" />
                                        </p>
                                    </div>
                                    <div className="milestone-box">
                                        <h4>
                                            2013
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2013MessageScratch2" />
                                        </p>
                                        <img src="/images/annual-report/milestones/2013_Scratch2.png" />
                                    </div>
                                    <div className="milestone-box">
                                        <h4>
                                            2014
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2014Message" />
                                        </p>
                                        <img src="/images/annual-report/milestones/2014_ScratchJr.jpg" />
                                    </div>
                                    <div className="milestone-box">
                                        <h4>
                                            2016
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2016Message" />
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <MediaQuery minWidth={frameless.desktop}>
                                <img src="/images/annual-report/milestones/timeline_line_right.svg" />
                            </MediaQuery>
                            <div className="milestones-wrapper">
                                <div className="milestones-column left">
                                    <div className="milestone-box">
                                        <h4>
                                            2017
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2017Message" />
                                        </p>
                                    </div>
                                    <div className="milestone-box">
                                        <h4>
                                            2019
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2019MessageScratch3" />
                                        </p>
                                        <img src="/images/annual-report/milestones/2019_Scratch3.jpg" />
                                    </div>
                                    <div className="milestone-box">
                                        <h4>
                                            2019
                                            {/* TODO should this be localized? */}
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.milestones2019MessageMove" />
                                        </p>
                                    </div>
                                </div>
                                <div className="milestones-column right">
                                    <MediaQuery minWidth={frameless.desktop}>
                                        <img
                                            className="single-image"
                                            src="/images/annual-report/milestones/timeline4.svg"
                                        />
                                    </MediaQuery>
                                </div>
                            </div>
                        </div>
                        <MediaQuery minWidth={frameless.desktop}>
                            <div className="transition-images">
                                <div className="left-image">
                                    <img src="/images/annual-report/milestones/vertical-loop.svg" />
                                </div>
                                <div className="cropped-image">
                                    <img src="/images/annual-report/milestones/painting-hand.svg" />
                                </div>
                            </div>
                        </MediaQuery>
                    </div>
                    <div
                        className="reach-section section"
                        ref={this.setRef(SECTIONS.reach)}
                    >
                        <div className="inner">
                            <div className="reach-intro">
                                <h2>
                                    <FormattedMessage id="annualReport.reachTitle" />
                                </h2>
                                <p>
                                    <FormattedMessage id="annualReport.reachSubtitle" />
                                </p>
                                <img src="/images/annual-report/Calendar.svg" />
                                <div className="reach-numbers">
                                    <div className="reach-datapoint">
                                        <FormattedMessage
                                            id="annualReport.reach170million"
                                            values={{
                                                million: (
                                                    <div className="million">
                                                        <FormattedMessage id="annualReport.reachMillion" />
                                                    </div>
                                                )
                                            }}
                                        />
                                        <h4>
                                            <FormattedMessage id="annualReport.reachUniqueVisitors" />
                                        </h4>
                                    </div>
                                    <div className="reach-datapoint">
                                        <FormattedMessage
                                            id="annualReport.reach60million"
                                            values={{
                                                million: (
                                                    <div className="million">
                                                        <FormattedMessage id="annualReport.reachMillion" />
                                                    </div>
                                                )
                                            }}
                                        />
                                        <h4>
                                            <FormattedMessage id="annualReport.reachProjectsCreated" />
                                        </h4>
                                    </div>
                                    <div className="reach-datapoint">
                                        <FormattedMessage
                                            id="annualReport.reach20million"
                                            values={{
                                                million: (
                                                    <div className="million">
                                                        <FormattedMessage id="annualReport.reachMillion" />
                                                    </div>
                                                )
                                            }}
                                        />
                                        <h4>
                                            <FormattedMessage id="annualReport.reachProjectCreators" />
                                        </h4>
                                    </div>
                                    <div className="reach-datapoint">
                                        <FormattedMessage
                                            id="annualReport.reach48million"
                                            values={{
                                                million: (
                                                    <div className="million">
                                                        <FormattedMessage id="annualReport.reachMillion" />
                                                    </div>
                                                )
                                            }}
                                        />
                                        <h4>
                                            <FormattedMessage id="annualReport.reachComments" />
                                        </h4>
                                    </div>
                                </div>
                            </div>
                            <div className="reach-growth">
                                <div className="growth-blurb">
                                    <h3>
                                        <FormattedMessage id="annualReport.reachGrowthTitle" />
                                    </h3>
                                    <p>
                                        <FormattedMessage id="annualReport.reachGrowthBlurb" />
                                    </p>
                                </div>
                                <img src="/images/annual-report/milestones/community-growth-graph.svg" />
                            </div>
                        </div>
                        <div className="map-inner">
                            <div className="reach-map">
                                <h3>
                                    <FormattedMessage id="annualReport.reachGlobalCommunity" />
                                </h3>
                                <p>
                                    <FormattedMessage id="annualReport.reachMapBlurb" />
                                </p>
                                <MediaQuery minWidth={frameless.desktop}>
                                    <WorldMap
                                        className="map"
                                        colorIndex={colorIndex}
                                        countryData={countryData}
                                        countryNames={countryNames}
                                        mapHeight={530}
                                        mapWidth={1060}
                                    />
                                </MediaQuery>
                                <MediaQuery
                                    maxWidth={frameless.desktop - 1}
                                    minWidth={frameless.tabletPortrait}
                                >
                                    <WorldMap
                                        className="map"
                                        colorIndex={colorIndex}
                                        countryData={countryData}
                                        countryNames={countryNames}
                                        mapHeight={450}
                                        mapWidth={900}
                                    />
                                </MediaQuery>
                                <MediaQuery
                                    maxWidth={frameless.tabletPortrait - 1}
                                    minWidth={frameless.mobileIntermediate}
                                >
                                    <WorldMap
                                        className="map"
                                        colorIndex={colorIndex}
                                        countryData={countryData}
                                        countryNames={countryNames}
                                        mapHeight={400}
                                        mapWidth={800}
                                    />
                                </MediaQuery>
                                <MediaQuery maxWidth={frameless.mobileIntermediate - 1}>
                                    <WorldMap
                                        className="map"
                                        colorIndex={colorIndex}
                                        countryData={countryData}
                                        countryNames={countryNames}
                                        mapHeight={172}
                                        mapWidth={396}
                                    />
                                </MediaQuery>
                            </div>
                        </div>
                        <div className="inner">
                            <div className="reach-translation">
                                <div className="reach-translation-intro">
                                    <h3>
                                        <FormattedMessage id="annualReport.reachTranslationTitle" />
                                    </h3>
                                    <p>
                                        <FormattedMessage id="annualReport.reachTranslationBlurb" />
                                    </p>
                                </div>
                                <img src="/images/annual-report/translated-illustration.svg" />
                            </div>
                        </div>
                        <div className="scratch-jr-transition-img">
                            <img src="/images/annual-report/horizontal-command.svg" />
                        </div>
                    </div>
                    <div className="reach-scratch-jr">
                        <div className="inner">
                            <div className="scratch-jr-intro">
                                <img src="/images/annual-report/ScratchJr-Logo.svg" />
                                <p>
                                    <FormattedMessage id="annualReport.reachScratchJrBlurb" />
                                </p>
                            </div>
                            <div className="reach-datapoint">
                                <FormattedMessage
                                    id="annualReport.reach22million"
                                    values={{
                                        million: (
                                            <div className="million">
                                                <FormattedMessage id="annualReport.reachMillion" />
                                            </div>
                                        )
                                    }}
                                />
                                <h4>
                                    <FormattedMessage id="annualReport.reachDownloads" />
                                </h4>
                            </div>
                        </div>
                        <div className="scratch-jr-transition-img">
                            <img src="/images/annual-report/horizontal-loop.svg" />
                        </div>
                    </div>
                    <div
                        className="initiatives-section section"
                        ref={this.setRef(SECTIONS.initiatives)}
                    >
                        <div className="initiatives-intro">
                            <div className="inner">
                                <h2>
                                    <FormattedMessage id="annualReport.initiativesTitle" />
                                </h2>
                                <div className="initiatives-pillars">
                                    <div className="three-pillars">
                                        <div className="pillar-splash tools">
                                            <h4>
                                                <FormattedMessage id="annualReport.toolsTitle" />
                                            </h4>
                                        </div>
                                        <div className="pillar-splash community">
                                            <h4>
                                                <FormattedMessage id="annualReport.communityTitle" />
                                            </h4>
                                        </div>
                                        <div className="pillar-splash schools">
                                            <h4>
                                                <FormattedMessage id="annualReport.schoolsTitle" />
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="equity-and-global">
                                        <div className="pillar-splash equity">
                                            <h4>
                                                <FormattedMessage id="annualReport.equity" />
                                            </h4>
                                        </div>
                                        <div className="pillar-splash global">
                                            <h4>
                                                <FormattedMessage id="annualReport.globalStrategy" />
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="initiatives-tools">
                            <div className="initiatives-subsection-header tools">
                                <div className="inner">
                                    <h2>
                                        <FormattedMessage id="annualReport.toolsTitle" />
                                    </h2>
                                    <p>
                                        <FormattedMessage id="annualReport.toolsIntro" />
                                    </p>
                                </div>
                            </div>
                            <div className="initiatives-subsection-content">
                                {/* eslint-disable max-len */}
                                <div className="inner">
                                    <div className="subsection-tag">
                                        <FormattedMessage id="annualReport.toolsSpotlight" />
                                    </div>
                                    <div className="initiatives-subsection-intro">
                                        <h2>
                                            <FormattedMessage id="annualReport.toolsLaunch" />
                                        </h2>
                                        <p>
                                            <FormattedMessage id="annualReport.toolsLaunchIntro1" />
                                        </p>
                                        <p>
                                            <FormattedMessage id="annualReport.toolsLaunchIntro2" />
                                        </p>
                                    </div>
                                </div>
                                <div className="hero">
                                    <img
                                        className="left"
                                        src="/images/annual-report/initiatives/3.0 Left.svg"
                                    />
                                    <img
                                        className="right"
                                        src="/images/annual-report/initiatives/3.0 Right.svg"
                                    />
                                </div>
                                <div className="inner">
                                    <div className="tools-extensions">
                                        <div className="tools-extension">
                                            <img src="/images/annual-report/initiatives/Text-to-Speech Block.svg" />
                                            <h4>
                                                <FormattedMessage id="annualReport.toolsTexttoSpeech" />
                                            </h4>
                                            <p>
                                                <FormattedMessage id="annualReport.toolsTexttoSpeechIntro" />
                                            </p>
                                            <div className="tools-stats">
                                                <div className="tools-stat">
                                                    <FormattedMessage
                                                        id="annualReport.toolsTexttoSpeechProjects"
                                                        values={{
                                                            numProjects: (
                                                                <h5>
                                                                    <FormattedMessage id="annualReport.toolsNumProjects" />
                                                                </h5>
                                                            )
                                                        }}
                                                    />
                                                </div>
                                                <div className="tools-stat">
                                                    <FormattedMessage
                                                        id="annualReport.toolsTexttoSpeechPopular"
                                                        values={{
                                                            mostPopular: (
                                                                <h5>
                                                                    <FormattedMessage id="annualReport.toolsMostPopular" />
                                                                </h5>
                                                            )
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="subsection-tag collaborator">
                                                <FormattedMessage id="annualReport.toolsCollabAWS" />
                                            </div>
                                        </div>
                                        <div className="tools-extension">
                                            <img src="/images/annual-report/initiatives/Translation Block.svg" />
                                            <h4>
                                                <FormattedMessage id="annualReport.toolsTranslate" />
                                            </h4>
                                            <p>
                                                <FormattedMessage id="annualReport.toolsTranslateIntro" />
                                            </p>
                                            <div className="tools-stats">
                                                <div className="tools-stat">
                                                    <FormattedMessage
                                                        id="annualReport.toolsTranslateLanguages"
                                                        values={{
                                                            numLanguages: (
                                                                <h5>
                                                                    <FormattedMessage id="annualReport.toolsNumLanguages" />
                                                                </h5>
                                                            )
                                                        }}
                                                    />
                                                </div>
                                                <div className="tools-stat">
                                                    <FormattedMessage
                                                        id="annualReport.toolsTranslateLiteracy"
                                                        values={{
                                                            supportsLiteracy: (
                                                                <h5>
                                                                    <FormattedMessage id="annualReport.toolsSupportsLiteracy" />
                                                                </h5>
                                                            ),
                                                            CSandLanguageArtsLink: (
                                                                <a
                                                                    href="https://www.pila-cs.org/"
                                                                    rel="noreferrer noopener"
                                                                    target="_blank"
                                                                >
                                                                    <FormattedMessage id="annualReport.toolsCSandLanguageArts" />
                                                                </a>
                                                            )
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="subsection-tag collaborator">
                                                <FormattedMessage id="annualReport.toolsCollabGoogle" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tools-LEGO">
                                        <img src="/images/annual-report/initiatives/LEGO Robotics Illustration.svg" />
                                        <div className="tools-LEGO-info">
                                            <h4>
                                                <FormattedMessage id="annualReport.toolsLEGORobotics" />
                                            </h4>
                                            <p>
                                                <FormattedMessage
                                                    id="annualReport.toolsLEGORoboticsIntro"
                                                    values={{
                                                        mindstormsLink: (
                                                            <a
                                                                href="https://scratch.wistia.com/medias/0huu6wfiki"
                                                                rel="noreferrer noopener"
                                                                target="_blank"
                                                            >
                                                                <FormattedMessage id="annualReport.toolsMindstormsLink" />
                                                            </a>
                                                        ),
                                                        weDoLink: (
                                                            <a
                                                                href="https://scratch.wistia.com/medias/4im7iizv47"
                                                                rel="noreferrer noopener"
                                                                target="_blank"
                                                            >
                                                                <FormattedMessage id="annualReport.toolsWeDoLink" />
                                                            </a>
                                                        )
                                                    }}
                                                />
                                            </p>
                                            <div className="subsection-tag collaborator">
                                                <FormattedMessage id="annualReport.toolsCollabLEGO" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tools-tutorials">
                                        <h4>
                                            <FormattedMessage id="annualReport.toolsVideoTutorials" />
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.toolsTutorialsIntro" />
                                        </p>
                                        <div className="tutorial-list">
                                            <img src="/images/annual-report/initiatives/animate a name.png" />
                                            <img src="/images/annual-report/initiatives/make music.png" />
                                            <img src="/images/annual-report/initiatives/imagine a world.png" />
                                            <img src="/images/annual-report/initiatives/create a story.png" />
                                        </div>
                                        <div className="tools-stats">
                                            <div className="tools-stat">
                                                <FormattedMessage
                                                    id="annualReport.toolsNewTutorials"
                                                    values={{
                                                        numTutorials: (
                                                            <h5>
                                                                <FormattedMessage id="annualReport.toolsNumTutorials" />
                                                            </h5>
                                                        )
                                                    }}
                                                />
                                            </div>
                                            <div className="tools-stat">
                                                <FormattedMessage
                                                    id="annualReport.toolsTutorialsViews"
                                                    values={{
                                                        numViews: (
                                                            <h5>
                                                                <FormattedMessage id="annualReport.toolsNumViews" />
                                                            </h5>
                                                        )
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tools-app">
                                        <div className="tools-app-info">
                                            <h4>
                                                <FormattedMessage id="annualReport.toolsApp" />
                                            </h4>
                                            <p>
                                                <FormattedMessage
                                                    id="annualReport.toolsAppIntro"
                                                    values={{
                                                        downloadableLink: (
                                                            <a
                                                                href="https://scratch.mit.edu/download"
                                                                rel="noreferrer noopener"
                                                                target="_blank"
                                                            >
                                                                <FormattedMessage id="annualReport.toolsDownloadLink" />
                                                            </a>
                                                        ),
                                                        raspberryLink: (
                                                            <a
                                                                href="https://www.raspberrypi.org/blog/scratch-3-desktop-for-raspbian-on-raspberry-pi/"
                                                                rel="noreferrer noopener"
                                                                target="_blank"
                                                            >
                                                                <FormattedMessage id="annualReport.toolsRaspberryLink" />
                                                            </a>
                                                        )
                                                    }}
                                                />
                                            </p>
                                        </div>
                                        <img src="/images/annual-report/initiatives/Offline Learning Illustration.svg" />
                                    </div>
                                    <div className="tools-abhi">
                                        <div className="subsection-tag">
                                            <FormattedMessage id="annualReport.toolsSpotlight" />
                                        </div>
                                        <div className="tools-abhi-intro">
                                            <div>
                                                <h2>
                                                    <FormattedMessage id="annualReport.toolsAbhiTitle" />
                                                </h2>
                                                <p>
                                                    <FormattedMessage id="annualReport.toolsAbhiIntro" />
                                                </p>
                                            </div>
                                            <img src="/images/annual-report/initiatives/Abhi Hero.svg" />
                                        </div>
                                    </div>
                                </div>
                                <div className="video-container">
                                    <div className="video-background abhi">
                                        <MediaQuery minWidth={frameless.tabletPortrait}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/CN Video Thumbnail.png"
                                                thumbnailWidth="580"
                                                videoHeight="320"
                                                videoId="r2ctnvb0sy"
                                                videoWidth="568"
                                            />
                                        </MediaQuery>
                                        <MediaQuery
                                            maxWidth={frameless.tabletPortrait - 1}
                                            minWidth={frameless.mobile}
                                        >
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/CN Video Thumbnail.png"
                                                thumbnailWidth="400"
                                                videoHeight="320"
                                                videoId="r2ctnvb0sy"
                                                videoWidth="568"
                                            />
                                        </MediaQuery>
                                        <MediaQuery maxWidth={frameless.mobile - 1}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/CN Video Thumbnail.png"
                                                thumbnailWidth="300"
                                                videoHeight="216"
                                                videoId="r2ctnvb0sy"
                                                videoWidth="380"
                                            />
                                        </MediaQuery>
                                    </div>
                                </div>
                                <div className="inner abhi">
                                    <div className="abhi-quote">
                                        <div className="quote-person">
                                            <Avatar
                                                alt=""
                                                src="/images/annual-report/initiatives/Abhi Avatar.png"
                                            />
                                            <div>Abhi</div>
                                        </div>
                                        <Comment
                                            comment={this.props.intl.formatMessage(
                                                {id: 'annualReport.toolsAbhiQuote'}
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="initiatives-community">
                            <div className="initiatives-subsection-header community">
                                <div className="inner">
                                    <h2>
                                        <FormattedMessage id="annualReport.communityTitle" />
                                    </h2>
                                    <p>
                                        <FormattedMessage id="annualReport.communityIntro" />
                                    </p>
                                </div>
                            </div>
                            <div className="initiatives-subsection-content">
                                {/* eslint-disable max-len */}
                                <div className="inner">
                                    <div className="subsection-tag">
                                        <FormattedMessage id="annualReport.communitySpotlight" />
                                    </div>
                                    <div className="initiatives-subsection-intro">
                                        <h2>
                                            <FormattedMessage id="annualReport.communityTeam" />
                                        </h2>
                                        <p>
                                            <FormattedMessage id="annualReport.communityTeamIntro1" />
                                        </p>
                                        <p>
                                            <FormattedMessage id="annualReport.communityTeamIntro2" />
                                        </p>
                                    </div>
                                </div>
                                <div className="community-hero-img" />
                                <div className="inner">
                                    <div className="moderation-and-guidelines">
                                        <div className="community-moderation">
                                            <h4>
                                                <FormattedMessage id="annualReport.communityModerationTitle" />
                                            </h4>
                                            <p>
                                                <FormattedMessage id="annualReport.communityModerationInfo" />
                                            </p>
                                        </div>
                                        <div className="community-guidelines">
                                            <h4>
                                                <FormattedMessage id="annualReport.communityGuidelinesTitle" />
                                            </h4>
                                            <p>
                                                <FormattedMessage id="annualReport.communityGuidelinesInfo" />
                                            </p>
                                            <div className="guidelines-list">
                                                <ul>
                                                    <li>
                                                        <FormattedMessage
                                                            id="annualReport.communityGuidelinesRespect"
                                                        />
                                                    </li>
                                                    <li>
                                                        <FormattedMessage id="annualReport.communityGuidelinesShare" />
                                                    </li>
                                                    <li>
                                                        <FormattedMessage id="annualReport.communityGuidelinesHonest" />
                                                    </li>
                                                </ul>
                                                <ul>
                                                    <li>
                                                        <FormattedMessage
                                                            id="annualReport.communityGuidelinesConstructive"
                                                        />
                                                    </li>
                                                    <li>
                                                        <FormattedMessage
                                                            id="annualReport.communityGuidelinesPrivacy"
                                                        />
                                                    </li>
                                                    <li>
                                                        <FormattedMessage
                                                            id="annualReport.communityGuidelinesFriendly"
                                                        />
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="community-engagement">
                                        <h4>
                                            <FormattedMessage id="annualReport.communityEngagementTitle" />
                                        </h4>
                                        <p>
                                            <FormattedMessage
                                                id="annualReport.communityEngagementInfo"
                                                values={{
                                                    storySwapLink: (
                                                        <a
                                                            href="/studios/25034966/"
                                                            target="_blank"
                                                        >
                                                            <FormattedMessage id="annualReport.storySwap" />
                                                        </a>
                                                    )
                                                }}
                                            />
                                        </p>
                                    </div>
                                    <div className="community-sds">
                                        <h3>
                                            <FormattedMessage id="annualReport.communitySDSTitle" />
                                        </h3>
                                        <p>
                                            <FormattedMessage id="annualReport.communitySDSInfo" />
                                        </p>
                                        <div className="sds-list">
                                            <div className="sds-tile">
                                                <a
                                                    href="studios/6234813/"
                                                    target="_blank"
                                                >
                                                    <img
                                                        src="/images/annual-report/initiatives/Day in the Life Thumbnail.png"
                                                    />
                                                    <FormattedMessage id="annualReport.communityDayintheLife" />
                                                </a>
                                                <p>
                                                    <FormattedMessage id="annualReport.communityDayintheLifeInfo" />
                                                </p>
                                            </div>
                                            <div className="sds-tile">
                                                <a
                                                    href="studios/5801323/"
                                                    target="_blank"
                                                >
                                                    <img
                                                        src="/images/annual-report/initiatives/Year 3000 Thumbnail.png"
                                                    />
                                                    <FormattedMessage id="annualReport.communityYear3000" />
                                                </a>
                                                <p>
                                                    <FormattedMessage id="annualReport.communityYear3000Info" />
                                                </p>
                                            </div>
                                            <div className="sds-tile">
                                                <a
                                                    href="studios/5702799/"
                                                    target="_blank"
                                                >
                                                    <img
                                                        src="/images/annual-report/initiatives/Bounce Thumbnail.png"
                                                    />
                                                    <FormattedMessage id="annualReport.communityBounce" />
                                                </a>
                                                <p>
                                                    <FormattedMessage id="annualReport.communityBounceInfo" />
                                                </p>
                                            </div>
                                            <div className="sds-tile">
                                                <a
                                                    href="studios/5944573/"
                                                    target="_blank"
                                                >
                                                    <img
                                                        src="/images/annual-report/initiatives/Monochromatic Thumbnail.png"
                                                    />
                                                    <FormattedMessage id="annualReport.communityMonochromatic" />
                                                </a>
                                                <p>
                                                    <FormattedMessage id="annualReport.communityMonochromaticInfo" />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="subsection-tag quotes-tag">
                                        <FormattedMessage id="annualReport.communityQuotes" />
                                    </div>
                                    <div className="community-quotes">
                                        <div className="community-quote">
                                            <div className="quote-person">
                                                <Avatar
                                                    alt=""
                                                    src="https://cdn.scratch.mit.edu/get_image/user/36591_80x80.png"
                                                />
                                                <div>angelical</div>
                                            </div>
                                            <Comment
                                                comment={this.props.intl.formatMessage(
                                                    {id: 'annualReport.communityQuote1'}
                                                )}
                                            />
                                        </div>
                                        <div className="community-quote">
                                            <div className="quote-person">
                                                <Avatar
                                                    alt=""
                                                    src="https://cdn.scratch.mit.edu/get_image/user/61442584_80x80.png"
                                                />
                                                <div>dlore2009</div>
                                            </div>
                                            <Comment
                                                comment={this.props.intl.formatMessage(
                                                    {id: 'annualReport.communityQuote2'}
                                                )}
                                            />
                                        </div>
                                        <div className="community-quote">
                                            <div className="quote-person">
                                                <Avatar
                                                    alt=""
                                                    src="https://cdn.scratch.mit.edu/get_image/user/56150500_80x80.png"
                                                />
                                                <div>qood</div>
                                            </div>
                                            <Comment
                                                comment={this.props.intl.formatMessage(
                                                    {id: 'annualReport.communityQuote3'}
                                                )}
                                            />
                                        </div>
                                        <div className="community-quote">
                                            <div className="quote-person">
                                                <Avatar
                                                    alt=""
                                                    src="https://cdn.scratch.mit.edu/get_image/user/176301_80x80.png"
                                                />
                                                <div>Mechanical_pencil</div>
                                            </div>
                                            <Comment
                                                comment={this.props.intl.formatMessage(
                                                    {id: 'annualReport.communityQuote4'}
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="subsection-tag blm-tag">
                                        <FormattedMessage id="annualReport.communitySpotlight" />
                                    </div>
                                    <div className="community-blm">
                                        <div className="blm-intro">
                                            <h2>Black Lives Matter</h2>
                                            <p>
                                                <FormattedMessage
                                                    id="annualReport.communityBLMIntro"
                                                    values={{
                                                        BLMStudioLink: (
                                                            <a
                                                                href="/studio/26964367"
                                                                target="_blank"
                                                            >
                                                                Black Lives Matter <FormattedMessage
                                                                    id="annualReport.studio"
                                                                />
                                                            </a>
                                                        )
                                                    }}
                                                />
                                            </p>
                                        </div>
                                        <div className="blm-image">
                                            <img src="/images/annual-report/initiatives/BLM Hero.svg" />
                                            <b>
                                                <FormattedMessage id="annualReport.communityArtwork" />
                                            </b>
                                        </div>
                                        <div className="blm-projects">
                                            <Grid
                                                showAvatar
                                                items={BLMProjects}
                                                showFavorites={false}
                                                showLoves={false}
                                                showViews={false}
                                            />
                                        </div>
                                        <div className="blm-change">
                                            <h3>
                                                <FormattedMessage id="annualReport.communityChangeTitle" />
                                            </h3>
                                            <p>
                                                <FormattedMessage id="annualReport.communityChangeInfo" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="video-container">
                                    <div className="video-background blm">
                                        <MediaQuery minWidth={frameless.tabletPortrait}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/BLM Video Thumbnail.png"
                                                thumbnailWidth="580"
                                                videoHeight="320"
                                                videoId="r1pmlyylye"
                                                videoWidth="568"
                                            />
                                        </MediaQuery>
                                        <MediaQuery
                                            maxWidth={frameless.tabletPortrait - 1}
                                            minWidth={frameless.mobile}
                                        >
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/BLM Video Thumbnail.png"
                                                thumbnailWidth="400"
                                                videoHeight="320"
                                                videoId="r1pmlyylye"
                                                videoWidth="568"
                                            />
                                        </MediaQuery>
                                        <MediaQuery maxWidth={frameless.mobile - 1}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/BLM Video Thumbnail.png"
                                                thumbnailWidth="300"
                                                videoHeight="216"
                                                videoId="r1pmlyylye"
                                                videoWidth="380"
                                            />
                                        </MediaQuery>
                                    </div>
                                </div>
                            </div>
                            {/* eslint-enable max-len */}
                        </div>
                        <div className="initiatives-schools">
                            <div className="initiatives-subsection-header schools">
                                <div className="inner">
                                    <h2>
                                        <FormattedMessage id="annualReport.schoolsTitle" />
                                    </h2>
                                    <p>
                                        <FormattedMessage id="annualReport.schoolsIntro" />
                                    </p>
                                </div>
                            </div>
                            <div className="initiatives-subsection-content">
                                <div className="inner schools">
                                    <div className="subsection-tag">
                                        <FormattedMessage id="annualReport.schoolsSpotlight" />
                                    </div>
                                    <div className="initiatives-subsection-intro schools">
                                        <h2>
                                            <FormattedMessage id="annualReport.cpsProjectTitle" />
                                        </h2>
                                        <p>
                                            <FormattedMessage id="annualReport.cpsProjectIntroP1" />
                                        </p>
                                        <p>
                                            <FormattedMessage id="annualReport.cpsProjectIntroP2" />
                                        </p>
                                    </div>
                                </div>
                                <div className="video-container">
                                    <div className="video-background cps">
                                        {/* eslint-disable max-len */}
                                        <MediaQuery minWidth={frameless.tabletPortrait}>
                                            <VideoPreview
                                                isYouTube
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/schools/CPS Story/CPS Video Thumbnail.png"
                                                thumbnailWidth="580"
                                                videoHeight="320"
                                                videoId="9QD9IxOinLg"
                                                videoWidth="568"
                                            />
                                        </MediaQuery>
                                        <MediaQuery
                                            maxWidth={frameless.tabletPortrait - 1}
                                            minWidth={frameless.mobile}
                                        >
                                            <VideoPreview
                                                isYouTube
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/schools/CPS Story/CPS Video Thumbnail.png"
                                                thumbnailWidth="400"
                                                videoHeight="216"
                                                videoId="9QD9IxOinLg"
                                                videoWidth="380"
                                            />
                                        </MediaQuery>
                                        <MediaQuery maxWidth={frameless.mobile - 1}>
                                            <VideoPreview
                                                isYouTube
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/schools/CPS Story/CPS Video Thumbnail.png"
                                                thumbnailWidth="300"
                                                videoHeight="216"
                                                videoId="9QD9IxOinLg"
                                                videoWidth="380"
                                            />
                                        </MediaQuery>
                                        {/* eslint-enable max-len */}
                                    </div>
                                </div>
                                <div className="inner schools">
                                    <h4>
                                        <FormattedMessage id="annualReport.familyCreativeNightsHeader" />
                                    </h4>
                                    <p>
                                        <FormattedMessage id="annualReport.familyCreativeNightsDescription" />
                                    </p>
                                </div>
                                <div className="inner four-pictures-container">
                                    <div className="pencils-img">
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Pencils.svg" />
                                    </div>
                                    <div className="four-pictures">
                                        {/* eslint-disable max-len */}
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Family Night 1.png" />
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Family Night 2.png" />
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Family Night 3.png" />
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Family Night 4.png" />
                                        {/* eslint-enable max-len */}
                                    </div>
                                    <div className="pizza-img">
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Pizza.svg" />
                                    </div>
                                    <div className="photo-credit">
                                        <p>
                                            <FormattedMessage id="annualReport.familyNightsPhotoCredit" />
                                        </p>
                                    </div>
                                </div>
                                <div className="inner schools">
                                    <h4>
                                        <FormattedMessage id="annualReport.teacherPDHeader" />
                                    </h4>
                                    <p>
                                        <FormattedMessage id="annualReport.teacherPDDescription" />
                                    </p>
                                    <div className="teacher-quote">
                                        <div className="quote-person">
                                            {/* eslint-disable max-len */}
                                            <Avatar
                                                alt=""
                                                src="/images/annual-report/initiatives/schools/CPS Story/School Quote Avatar.png"
                                            />
                                            {/* eslint-enable max-len */}
                                            <div>
                                                <FormattedMessage
                                                    id="annualReport.teacherPDQuoteAttribution"
                                                    values={{
                                                        teacherName: 'Mahmoud Aliamer'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <Comment
                                            comment={this.props.intl.formatMessage(
                                                {id: 'annualReport.teacherPDQuote'}
                                            )}
                                        />
                                    </div>
                                    <div className="extending-reach">
                                        <h4>
                                            <FormattedMessage id="annualReport.extendingReachHeader" />
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.extendingReachDescription" />
                                        </p>
                                    </div>
                                    <h4>
                                        <FormattedMessage id="annualReport.inTheNewsHeader" />
                                    </h4>
                                    <div className="news-links">
                                        {/* eslint-disable max-len */}
                                        <div className="icon-and-link">
                                            <img src="/images/annual-report/initiatives/schools/CPS Story/News Icon.svg" />
                                            <a
                                                href="https://chicago.suntimes.com/2019/12/9/21003124/chance-rapper-superme-i-love-you-so-much-cps-public-schools-video-game-google"
                                                rel="noreferrer noopener"
                                                target="_blank"
                                            >
                                                <FormattedMessage id="annualReport.chicagoSunTimesArticle" />
                                            </a>
                                        </div>
                                        <div className="icon-and-link">
                                            <img src="/images/annual-report/initiatives/schools/CPS Story/News Icon.svg" />
                                            <a
                                                href="https://www.rollingstone.com/music/music-news/chance-the-rapper-i-love-you-so-much-video-game-made-by-chicago-students-925198/"
                                                rel="noreferrer noopener"
                                                target="_blank"
                                            >
                                                <FormattedMessage id="annualReport.rollingStonesArticle" />
                                            </a>
                                        </div>
                                        {/* eslint-enable max-len */}
                                    </div>
                                </div>
                                <div className="inner schools-conferences">
                                    <div className="schools-conferences-header">
                                        <div className="subsection-tag">
                                            <FormattedMessage id="annualReport.schoolsSpotlight" />
                                        </div>
                                        <h2>
                                            <FormattedMessage id="annualReport.conferencesTitle" />
                                        </h2>
                                    </div>
                                    <div className="schools-conferences-intro">
                                        <p>
                                            <FormattedMessage id="annualReport.conferencesIntro" />
                                        </p>
                                        <MediaQuery minWidth={frameless.mobile}>
                                            <div className="conferences-hero-and-caption">
                                                {/* eslint-disable-next-line max-len */}
                                                <img src="/images/annual-report/initiatives/schools/Conferences Story/Scratch Conferences Hero.png" />
                                                <FormattedMessage
                                                    id="annualReport.conferencesHeroImageCaption"
                                                    values={{
                                                        photoCredit: 'Carmelo Presicce'
                                                    }}
                                                />
                                            </div>
                                        </MediaQuery>
                                    </div>
                                </div>
                                <MediaQuery maxWidth={frameless.mobile - 1}>
                                    <div className="conferences-hero-and-caption">
                                        <div className="conferences-hero" />
                                        <FormattedMessage
                                            id="annualReport.conferencesHeroImageCaption"
                                            values={{
                                                photoCredit: 'Carmelo Presicce'
                                            }}
                                        />
                                    </div>
                                </MediaQuery>
                                <div className="inner schools-conferences">
                                    <div className="schools-conferences-content">
                                        <div className="schools-conferences-region">
                                            <div className="conference-image-and-caption left">
                                                {/* eslint-disable-next-line max-len */}
                                                <img src="/images/annual-report/initiatives/schools/Conferences Story/Latin America Conference.png" />
                                                <FormattedMessage
                                                    id="annualReport.conferencesLatinAmericaImageCaption"
                                                    values={{
                                                        photoCredit: 'Scratch al Sur'
                                                    }}
                                                />
                                            </div>
                                            <div className="conference-title-and-description">
                                                <h4>
                                                    <FormattedMessage id="annualReport.conferencesLatinAmericaTitle" />
                                                </h4>
                                                <p>
                                                    {/* eslint-disable max-len */}
                                                    <FormattedMessage
                                                        id="annualReport.conferencesLatinAmericaDescription"
                                                        values={{
                                                            scratchAlSurLink: (
                                                                <a
                                                                    href="https://www.scratchalsur.org/"
                                                                    rel="noreferrer noopener"
                                                                    target="_blank"
                                                                >
                                                                    Scratch al Sur
                                                                </a>
                                                            ),
                                                            spanishVersionLink: (
                                                                <a
                                                                    href="https://scratchalsur.org/assets/computaci%c3%b3n-creativa.pdf"
                                                                    rel="noreferrer noopener"
                                                                    target="_blank"
                                                                >
                                                                    <FormattedMessage id="annualReport.conferencesSpanishVersionLinkText" />
                                                                </a>
                                                            ),
                                                            creativeComputingCurriculumLink: (
                                                                <a
                                                                    href="http://creativecomputing.gse.harvard.edu/guide/curriculum.html"
                                                                    rel="noreferrer noopener"
                                                                    target="_blank"
                                                                >
                                                                    Creative Computing Curriculum
                                                                </a>
                                                            )
                                                        }}
                                                    />
                                                    {/* eslint-enable max-len */}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="schools-conferences-region">
                                            <div className="conference-title-and-description left">
                                                <h4>
                                                    <FormattedMessage id="annualReport.conferencesEuropeTitle" />
                                                </h4>
                                                <p>
                                                    <FormattedMessage
                                                        id="annualReport.conferencesEuropeDescription"
                                                        values={{
                                                            scratchConferenceEuropeLink: (
                                                                <a
                                                                    href="https://www.raspberrypi.org/blog/keynote-speeches-scratch-conference-europe-2019/"
                                                                    rel="noreferrer noopener"
                                                                    target="_blank"
                                                                >
                                                                    Scratch Conference Europe
                                                                </a>
                                                            )
                                                        }}
                                                    />
                                                </p>
                                            </div>
                                            <div className="conference-image-and-caption">
                                                {/* eslint-disable-next-line max-len */}
                                                <img src="/images/annual-report/initiatives/schools/Conferences Story/Europe Conference.png" />
                                                <FormattedMessage
                                                    id="annualReport.conferencesEuropeImageCaption"
                                                    values={{
                                                        photoCredit: 'Raspberry Pi'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="schools-conferences-region">
                                            <div className="conference-image-and-caption left">
                                                {/* eslint-disable-next-line max-len */}
                                                <img src="/images/annual-report/initiatives/schools/Conferences Story/Africa Conference.png" />
                                                <FormattedMessage
                                                    id="annualReport.conferencesAfricaImageCaption"
                                                    values={{
                                                        photoCredit: 'Carmelo Presicce'
                                                    }}
                                                />
                                            </div>
                                            <div className="conference-title-and-description">
                                                <h4>
                                                    <FormattedMessage id="annualReport.conferencesAfricaTitle" />
                                                </h4>
                                                <p>
                                                    <FormattedMessage
                                                        id="annualReport.conferencesAfricaDescription"
                                                        values={{
                                                            scratchAfricaConferenceLink: (
                                                                <a
                                                                    href="https://www.scratchafrica.com/"
                                                                    rel="noreferrer noopener"
                                                                    target="_blank"
                                                                >
                                                                    Scratch Africa Conference
                                                                </a>
                                                            )
                                                        }}
                                                    />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="financials-section section"
                        ref={this.setRef(SECTIONS.financials)}
                    >
                        <div className="inner">
                            <h2 className="financials-h2">
                                <FormattedMessage id="annualReport.financialsTitle" />
                            </h2>
                            <h3>
                                <FormattedMessage id="annualReport.financialsRevenue" />
                            </h3>
                            <hr />
                            <div className="financials-content">
                                <div className="financials-table">
                                    <div className="circle-and-words">
                                        <img src="/images/annual-report/blue-circle.svg" />
                                        <div className="key-and-money">
                                            <p className="key">
                                                <FormattedMessage id="annualReport.financialsGrants" />
                                            </p>
                                            <p>
                                                $3,898,078
                                                <span className="percentage"> (82.7%)</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="circle-and-words">
                                        <img src="/images/annual-report/yellow-circle.svg" />
                                        <div className="key-and-money">
                                            <p className="key">
                                                <FormattedMessage id="annualReport.financialsEvents" />
                                            </p>
                                            <p>
                                                $700,000
                                                <span className="percentage"> (14.8%)</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="circle-and-words">
                                        <img src="/images/annual-report/green-circle.svg" />
                                        <div className="key-and-money">
                                            <p className="key">
                                                <FormattedMessage id="annualReport.financialsOther" />
                                            </p>
                                            <p>
                                                $114,982
                                                <span className="percentage"> (2.4%)</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="circle-and-words">
                                        <div className="key-and-money total">
                                            <p className="key">
                                                <FormattedMessage id="annualReport.financialsTotal" />
                                            </p>
                                            <p>
                                                $4,713,060
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <img
                                    className="graph"
                                    src="/images/annual-report/revenue-graph.svg"
                                />
                            </div>
                            <h3>
                                <FormattedMessage id="annualReport.financialsExpenses" />
                            </h3>
                            <hr />
                            <div className="financials-content">
                                <div className="financials-table">
                                    <div className="circle-and-words">
                                        <img src="/images/annual-report/blue-circle.svg" />
                                        <div className="key-and-money">
                                            <p className="key">
                                                <FormattedMessage id="annualReport.financialsProgram" />
                                            </p>
                                            <p>
                                                $1,135,767
                                                <span className="percentage"> (48.8%)</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="circle-and-words">
                                        <img src="/images/annual-report/yellow-circle.svg" />
                                        <div className="key-and-money">
                                            <p className="key">
                                                <FormattedMessage id="annualReport.financialsGeneral" />
                                            </p>
                                            <p>
                                                $224,104
                                                <span className="percentage"> (9.6%)</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="circle-and-words">
                                        <img src="/images/annual-report/green-circle.svg" />
                                        <div className="key-and-money">
                                            <p className="key">
                                                <FormattedMessage id="annualReport.financialsFundraising" />
                                            </p>
                                            <p>
                                                $962,958
                                                <span className="percentage"> (41.4%)</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="circle-and-words">
                                        <div className="key-and-money total">
                                            <p className="key">
                                                <FormattedMessage id="annualReport.financialsTotal" />
                                            </p>
                                            <p>
                                                $2,322,829
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <img
                                    className="graph"
                                    src="/images/annual-report/expenses-graph.svg"
                                />
                            </div>
                            <div className="financials-button-wrapper">
                                <a
                                    href="/pdfs/annual-report/2019/2019_audited_financials.pdf"
                                    target="_blank"
                                >
                                    <Button className="financials-button">
                                        <FormattedMessage id="annualReport.financialsButton" />
                                        <img
                                            className="download-icon"
                                            src="/images/annual-report/download-icon.svg"
                                        />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div
                        className="supporters-section section"
                        ref={this.setRef(SECTIONS.supporters)}
                    >
                        <div className="inner">
                            <div className="supporters-heading">
                                <h2>
                                    <FormattedMessage id="annualReport.supportersTitle" />
                                </h2>
                                <p>
                                    <FormattedHTMLMessage id="annualReport.supportersIntro" />
                                </p>
                            </div>
                            <div className="subsection-tag">
                                <FormattedHTMLMessage id="annualReport.supportersSpotlightTitle" />
                            </div>
                            <div className="supporters-subsection">
                                <div className="supporters-blurb">
                                    <h4>
                                        <FormattedMessage id="annualReport.supportersSFETitle" />
                                    </h4>
                                    <p>
                                        <FormattedMessage id="annualReport.supportersSFEDescription1" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.supportersSFEDescription2" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.supportersSFEDescription3" />
                                    </p>
                                </div>
                            </div>
                            <div className="david-siegel">
                                <div className="ds-info">
                                    <img src="/images/annual-report/david-siegel-photo.svg" />
                                    <div className="ds-text">
                                        <h4>David Siegel</h4>
                                        <FormattedMessage id="annualReport.supportersCoFounder" />
                                        <br />Two Sigma
                                    </div>
                                </div>
                                <div className="ds-quote">
                                    {/* eslint-disable-next-line */}
                                    <Comment comment={this.props.intl.formatMessage({id: 'annualReport.supportersQuote'})} />
                                </div>
                            </div>
                            <div className="supporters-subsection supporters-lists">
                                <div className="supporters-blurb">
                                    <h4>
                                        <FormattedHTMLMessage id="annualReport.supportersThankYou" />
                                    </h4>
                                    <p>
                                        <FormattedHTMLMessage id="annualReport.supportersAllDescription" />
                                    </p>
                                    <p className="founding-partners-blurb">
                                        <FormattedHTMLMessage id="annualReport.supportersFoundingDescription" />
                                    </p>
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedHTMLMessage id="annualReport.supportersFoundingTitle" />
                                    </h5>
                                    <hr />
                                    <div className="supporters-list">
                                        <ul className="supporters-list-side">
                                            <li>Massachusetts Institute of Technology</li>
                                            <li>National Science Foundation</li>
                                        </ul>
                                        <ul className="supporters-list-side">
                                            <li>Siegel Family Endowment</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedHTMLMessage id="annualReport.supportersCreativityTitle" />
                                    </h5>
                                    <hr />
                                    <div className="supporters-list">
                                        <ul className="supporters-list-side">
                                            <li>Google</li>
                                            <li>LEGO Foundation</li>
                                            <li>Little Bluebridge Foundation</li>
                                        </ul>
                                        <ul className="supporters-list-side">
                                            <li>Smilegate Foundation</li>
                                            <li>TAL Education</li>
                                            <li>WarnerMedia</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedHTMLMessage id="annualReport.supportersCollaborationTitle" />
                                    </h5>
                                    <hr />
                                    <div className="supporters-list">
                                        <ul className="supporters-list-side">
                                            <li>Mark Dalton</li>
                                            <li>Cindy and Evan Goldberg</li>
                                            <li>Paul T. Jones</li>
                                            <li>BrainPOP</li>
                                        </ul>
                                        <ul className="supporters-list-side">
                                            <li>Kahn-Rowe Family Fund</li>
                                            <li>LEGO Education</li>
                                            <li>Morgan Stanley</li>
                                            <li>Two Sigma</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedHTMLMessage id="annualReport.supportersImaginationTitle" />
                                    </h5>
                                    <hr />
                                    <div className="supporters-list">
                                        <ul className="supporters-list-side">
                                            <li>Alex Ginsburg</li>
                                            <li>James Tomilson Hill</li>
                                            <li>John Overdeck</li>
                                            <li>Mitchel Resnick</li>
                                            <li>David Shaw</li>
                                            <li>David Siegel</li>
                                            <li>Tao Ye</li>
                                            <li>Christos Zoulas</li>
                                            <li>AT&T Aspire</li>
                                            <li>Big Hen Group</li>
                                            <li>Bloomberg Philanthropies</li>
                                            <li>Citibank</li>
                                            <li>Credit Suisse</li>
                                            <li>EPAM</li>
                                        </ul>
                                        <ul className="supporters-list-side">
                                            <li>Facebook</li>
                                            <li>Goldman Sachs</li>
                                            <li>Huron Foundation</li>
                                            <li>Intel One-to-One Institute</li>
                                            <li>Piantino Family Foundation</li>
                                            <li>Playmates Toys</li>
                                            <li>Skadden Arps</li>
                                            <li>Societe Generale</li>
                                            <li>Solomon Wilson Family Foundation</li>
                                            <li>Tudor Investments</li>
                                            <li>UBS</li>
                                            <li>Vista Equity Partners</li>
                                            <li>Weill Family Foundation</li>
                                            <li>WestRiver Group</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedHTMLMessage id="annualReport.supportersInspirationTitle" />
                                    </h5>
                                    <hr />
                                    <div className="supporters-list">
                                        <ul className="supporters-list-side">
                                            <li>Erik Anderson</li>
                                            <li>Jon Claerbout</li>
                                            <li>Jonathan Dinu</li>
                                            <li>John Doerr</li>
                                            <li>Dan Huttenlocher</li>
                                            <li>Justin Nadler</li>
                                            <li>Ali-Milan Nekmouche</li>
                                            <li>Edward Schmidt</li>
                                            <li>Hope Smith</li>
                                            <li>Alfred Spector</li>
                                            <li>Ben Stein</li>
                                            <li>Donald Sussman</li>
                                            <li>Glen Whitney</li>
                                            <li>AIG</li>
                                            <li>Amazon</li>
                                        </ul>
                                        <ul className="supporters-list-side">
                                            <li>Bank of America</li>
                                            <li>Certified Moving & Storage</li>
                                            <li>Dalio Foundation, Inc.</li>
                                            <li>Dalton Family Foundation</li>
                                            <li>Deutsche Bank</li>
                                            <li>Ernst & Young</li>
                                            <li>Hearst Corporation</li>
                                            <li>HedgeServ</li>
                                            <li>Humble Bundle</li>
                                            <li>Intel Corporation</li>
                                            <li>Jenner & Block LLP</li>
                                            <li>La Vida Feliz Foundation</li>
                                            <li>Silicon Valley Bank</li>
                                            <li>Spin Master</li>
                                            <li>Union Square Ventures</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedHTMLMessage id="annualReport.supportersExplorationTitle" />
                                    </h5>
                                    <hr />
                                    <div className="supporters-list">
                                        <ul className="supporters-list-side">
                                            <li>Michael Ball</li>
                                            <li>Ken Baron</li>
                                            <li>Craig Barrett</li>
                                            <li>Adam Beder</li>
                                            <li>Mark Bezos</li>
                                            <li>Eric Chen</li>
                                            <li>Michael Cirillo</li>
                                            <li>Eric Dahm</li>
                                            <li>Peter Desmond</li>
                                            <li>Jeremy Deutsch</li>
                                            <li>John Doyle</li>
                                            <li>Kenneth Ehlert</li>
                                            <li>Tim Ettenheim </li>
                                            <li>Alan Eustace</li>
                                            <li>Steve Evans</li>
                                            <li>Catherine Greenspon</li>
                                            <li>Jonathan W. Hitchon</li>
                                            <li>Margaret Honey</li>
                                            <li>Andrew Janian</li>
                                            <li>David Joerg</li>
                                            <li>Mark Loughridge</li>
                                            <li>Carter Lyons</li>
                                            <li>Adam Messinger</li>
                                            <li>Robert and Bethany Millard </li>
                                            <li>Stephen M. Ross</li>
                                            <li>Wray Thorn</li>
                                        </ul>
                                        <ul className="supporters-list-side">
                                            <li>Jessica Traynor</li>
                                            <li>Adobe</li>
                                            <li>Anchor Point Foundation</li>
                                            <li>Barclays</li>
                                            <li>Blackstone Charitable Foundation</li>
                                            <li>Blackstone Group</li>
                                            <li>Cisco/Meraki</li>
                                            <li>Citco</li>
                                            <li>Deloitte</li>
                                            <li>Eclipse Contracting</li>
                                            <li>Funny or Die</li>
                                            <li>Hasbro</li>
                                            <li>J.P. Morgan</li>
                                            <li>Mattel</li>
                                            <li>McGraw Hill Education</li>
                                            <li>NHK</li>
                                            <li>Pearson</li>
                                            <li>Pershing Square Foundation</li>
                                            <li>SAP</li>
                                            <li>Scholastic</li>
                                            <li>The Ramsey Family Fund</li>
                                            <li>Thelonious Monk Institute of Jazz</li>
                                            <li>Via Technologies</li>
                                            <li>WilmerHale</li>
                                            <li>Zoshinkai Holdings</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="supporters-subsection supporters-lists">
                                <div className="supporters-level">
                                    <h3>
                                        <FormattedHTMLMessage id="annualReport.supportersInKindTitle" />
                                    </h3>
                                    <div className="supporters-list">
                                        <ul className="supporters-list-side">
                                            <li>Amazon Web Services</li>
                                            <li>Fastly</li>
                                            <li>New Relic</li>
                                        </ul>
                                        <ul className="supporters-list-side">
                                            <li>DK</li>
                                            <li>No Starch Press</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="leadership-section section"
                        ref={this.setRef(SECTIONS.leadership)}
                    >
                        <div className="inner">
                            <h2>
                                <FormattedMessage id="annualReport.leadershipTitle" />
                            </h2>
                            <h3>
                                <FormattedMessage id="annualReport.leadershipBoard" />
                            </h3>
                            <FlexRow className="leadership-board">
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipChair" />
                                    </b>
                                    <h4>Mitch Resnick</h4>
                                    <FormattedMessage id="annualReport.leadershipProfessor" />
                                    <br />MIT Media Lab
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipViceChair" />
                                    </b>
                                    <h4>David Siegel</h4>
                                    <FormattedMessage id="annualReport.supportersCoFounder" />
                                    <br />Two Sigma
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardMember" />
                                    </b>
                                    <h4>Margaret Honey</h4>
                                    <FormattedMessage id="annualReport.leadershipPresidentCEO" />
                                    <br />Two Sigma
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardMember" />
                                    </b>
                                    <h4>Christina Miller</h4>
                                    <FormattedMessage id="annualReport.leadershipFormerPresident" />
                                    <br />Cartoon Network
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardMember" />
                                    </b>
                                    <h4>Avraham Kadar</h4>
                                    <FormattedMessage id="annualReport.leadershipFounderCEO" />
                                    <br />BrainPOP
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardMember" />
                                    </b>
                                    <h4>Ursula Burns</h4>
                                    <FormattedMessage id="annualReport.leadershipFormerChairCEO" />
                                    <br />Xerox
                                </div>
                            </FlexRow>
                            <h4>
                                <FormattedMessage id="annualReport.leadershipBoardSecretaryTreasurer" />
                            </h4>
                            <FlexRow className="leadership-board">
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardSecretary" />
                                    </b>
                                    <h4>Sheri Vammen</h4>
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardTreasurer" />
                                    </b>
                                    <h4>Rich Sauer</h4>
                                </div>
                            </FlexRow>
                            <div className="leadership-scratch-team">
                                <h3>
                                    <FormattedMessage id="annualReport.leadershipScratchTeam" />
                                </h3>
                                <div className="executive-director">
                                    <PeopleGrid
                                        people={[{
                                            userName: 'Champ99',
                                            userId: 900283,
                                            name: 'Champika'
                                        }]}
                                    />
                                    <FormattedMessage id="annualReport.leadershipInterim" />
                                </div>
                                <PeopleGrid people={People} />
                            </div>
                        </div>
                    </div>
                    <div
                        className="donate-section section"
                        ref={this.setRef(SECTIONS.donate)}
                    >
                        <FlexRow className="donate-info">
                            <MediaQuery minWidth={frameless.tabletPortrait}>
                                <img src="/images/annual-report/donate-illustration.svg" />
                            </MediaQuery>
                            <div className="donate-content">
                                <h2>
                                    <FormattedMessage id="annualReport.donateTitle" />
                                </h2>
                                <p>
                                    <FormattedMessage id="annualReport.donateMessage" />
                                </p>
                                <a href="https://secure.donationpay.org/scratchfoundation/">
                                    <Button className="donate-button">
                                        <FormattedMessage id="annualReport.donateButton" />
                                    </Button>
                                </a>
                            </div>
                        </FlexRow>
                    </div>
                </div>
            </div>
        );
    }
}

AnnualReport.propTypes = {
    intl: intlShape
};

const WrappedAnnualReport = injectIntl(AnnualReport);

render(
    <Page><WrappedAnnualReport /></Page>, document.getElementById('app')
);
