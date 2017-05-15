import ComingUpWidget from 'widgets/comingUp/ComingUpWidget';

export default class TodaysView extends React.Component {
	constructor(props) {
		super(props);
		this.forceRender = ::this.forceRender;
	}

	componentWillMount() {
		App.bus.on('route:change', this.forceRender)
	}

	componentWillUnMount() {
		App.bus.off('route:change', this.forceRender)
	}

	forceRender() {
		this.forceUpdate();
	}

	/**
	 *
	 * @returns {XML}
     */
	render() {
		const sport = App.Globals.sport;
		const translatedSportName = App.Intl(`sport.name.${sport}`);
		const title = App.Intl('mybets.todays_sport', { sport: translatedSportName });

		const props = sport.toUpperCase() === 'HORSE_RACING' ? {
			groupBy: 'compId',
			titleBy: 'compName',
			useTabs: false,
			groupEvents: true
		} : {};

		return (
			<ComingUpWidget key={ `todays_${App.Globals.sport}` } title={title} tilespan={3} {...props} />
		);
	}
}
