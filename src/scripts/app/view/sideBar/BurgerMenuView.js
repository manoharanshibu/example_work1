import './BurgerMenuView.scss';

import HighlightsSection from 'app/view/sideBar/components/sections/HighlightsSection';
// import SportsSection from "app/view/sideBar/components/sections/SportsSection";
import AZsports from 'app/view/sideBar/components/sections/AZsports';
import FavouriteSportsSection from 'app/view/sideBar/components/sections/FavouriteSportsSection';
// import CompetitionsSection from "app/view/sideBar/components/sections/CompetitionsSection";
// import SportsHeaderSection from "app/view/sideBar/components/sections/SportsHeaderSection";

import InplaySportsSection from 'app/view/sideBar/components/sections/InplaySportsSection';
import BetHistorySection from 'app/view/sideBar/components/sections/BetHistorySection';
import TransactionSection from 'app/view/sideBar/components/sections/TransactionSection';
import SettingsSection from 'app/view/sideBar/components/sections/SettingsSection';
import OverviewSection from 'app/view/sideBar/components/sections/OverviewSection';
import WalletSection from 'app/view/sideBar/components/sections/WalletSection';
import ProductNavSection from 'app/view/sideBar/components/sections/ProductNavSection';
import CasinoCategoriesSection from 'app/view/sideBar/components/sections/CasinoCategoriesSection';
import OddsFormatSection from 'app/view/sideBar/components/OddsFormatSection.jsx';
import RaceCardsSection from 'app/view/sideBar/components/sections/RaceCardsSection';
import MultiViewSection from 'app/view/sideBar/components/sections/MultiViewSection';
import SearchField from 'app/view/components/SearchField';
// import CountrySection from "app/view/sideBar/components/sections/CountrySection";

import { TOGGLE_SIDE_BAR } from 'app/AppConstants';
import PodcastPlayer from 'header/view/components/PodcastPlayer';
import { TRIGGER_RESIZE } from 'app/AppConstants';

export default class BurgerMenuView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAccount: this.props.isAccount,
    };

    this.onResize = this.onResize.bind(this);
    App.bus.on(TRIGGER_RESIZE, this.onResize);
  }

  componentWillUnmount() {
    App.bus.off(TRIGGER_RESIZE, this.onResize);
  }

	/**
	 * @param e
	 */
  onToggleSideBar() {
    App.bus.trigger(TOGGLE_SIDE_BAR);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.isAccount !== this.props.isAccount) {
      this.setState({ isAccount: this.props.isAccount });
      return true;
    } else if (nextProps.viewportWidth !== this.props.viewportWidth) {
      return true;
    } else if (this.props.location.pathname !== nextProps.location.pathname) { // if path has changed update
      return true;
    } else if (nextState.burgerOpen !== this.props.burgerOpen) {
      return true;
    }

    return false;
  }

  onResize() {
    this.forceUpdate();
  }

  renderPodcastPlayer() {
    if (App.isMobile()) {
      return null;
    }
    return <PodcastPlayer key="podcastPlayer" />;
  }


  isUnderMediumBreakpoint() {
    return (this.props.viewportWidth < 768);
  }

  isUnderLargeBreakpoint() {
    return (this.props.viewportWidth < 992);
  }

  render() {
    let menu;
    if (this.props.isAccount) {
      menu = this.renderAcountMenu();
    } else if (this.props.isCasino) {
      menu = this.renderCasinoMenu();
    } else if (!App.Globals.isSportsbookAvailable) {
      menu = this.renderMinimal();
    } else {
      menu = this.renderMenu();
    }

    return (
      <div className={this.props.burgerClass} style={this.props.burgerStyle}>
        <div className="c-burger">
          {menu}
        </div>
      </div>
    );
  }

  renderOddsFormatSection() {
    if (this.isUnderLargeBreakpoint()) {
      return <OddsFormatSection key="OddsFormatSection" />;
    }
  }

	/**
	 * @returns {XML}
	 */
  renderMinimal() {
    return (
    [
      this.isUnderLargeBreakpoint() && (
      <ProductNavSection key={6} not="sportsbook" />
				),
      this.renderPodcastPlayer(),
    ]
    );
  }

	/**
	 * @returns {XML}
	 */
  renderMenu() {
    return (
    [
      <SearchField key="burgerMenuSearchField" />,
      this.isUnderLargeBreakpoint() && (
      <ProductNavSection key={2} just="sportsbook" />
				),
      <RaceCardsSection key={3} />,
      <MultiViewSection key={4} />,
      <InplaySportsSection key={5} expanded />,
      <HighlightsSection key={6} />,
      <FavouriteSportsSection key={7} {...this.props} />,
      <AZsports key={8} {...this.props} />,
				// <SportsSection key={6} {...this.props} />,
				// <CompetitionsSection key={7} {...this.props} />,
				// <CountrySection key={8} sport={App.Globals.sport} />,
      this.isUnderLargeBreakpoint() && (
      <ProductNavSection key={9} not="sportsbook" />
				),
      this.renderOddsFormatSection(),
      this.renderPodcastPlayer(),
    ]
    );
  }

  renderAcountMenu() {
    return (
    [
      this.isUnderLargeBreakpoint() && (
      <ProductNavSection key={1} />
				),

      <OverviewSection key={2} />,
      <WalletSection key={3} />,
      App.Globals.isSportsbookAvailable &&
      <BetHistorySection key={4} />,
				// <BetHistorySection key={5} isCasino="true" />,
      <TransactionSection key={6} />,
      <SettingsSection key={7} />,

      this.renderOddsFormatSection(),

      this.renderPodcastPlayer(),
    ]
    );
  }

  renderCasinoMenu() {
    return ([
      !App.isMobile() &&
      <SearchField key="burgerMenuSearchFieldCasino" casino />,

      this.isUnderLargeBreakpoint() && (
      <ProductNavSection key={1} just="casino" />
			),

      <CasinoCategoriesSection key="casinocategories" />,

      this.isUnderLargeBreakpoint() && (
      <ProductNavSection key={6} not="casino" />
			),
    ]);
  }
}
