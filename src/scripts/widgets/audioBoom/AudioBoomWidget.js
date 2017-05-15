import Widget from 'app/view/widgets/WidgetBase';
import React, {Component} from 'react';
import ReactPlayer from 'react-player'
import {classNames as cx} from 'common/util/ReactUtil';
import Podcasts from 'sportsbook/collection/Podcasts';
import {AUDIOBOOM_URL_CHANGED} from "app/AppConstants";

import './AudioBoom.scss';

export default class AudioBoomWidget extends React.Component {


	constructor(props) {
		super(props);
		this.state = {
			loggedIn: App.session.request('loggedIn'),
			podcasts: []
		};
		this.fetch();
	}

	static defaultProps = {
		tilespan: 1
	};

	/**
	 * event listener to check the login
	 */
	componentDidMount() {
		App.session.on('session:loggedin', this.onSessionChange, this);
		App.session.on('session:loggedout', this.onSessionChange, this);
	}

	componentWillUnmount() {
		App.session.off('session:loggedin', this.onSessionChange, this);
		App.session.off('session:loggedout', this.onSessionChange, this);

		// yes, this is a code smell:
		this.componentHasUnmounted = true;
	}

	onSessionChange(session) {
		this.setState({
			loggedIn: !!session
		});
	}

	fetch() {
		if (this.props.podcasts) {
			this.fetchPodcasts();
		}
	}

	/*
	 * Fetching the podcasts one by one from different URLs (it's using a recursion to keep the order)
	 */
	fetchPodcasts(array = [], i = 0) {
		// prevent callback function firing after component has unmounted:
		if (this.componentHasUnmounted) return;

		const podcasts = this.props.podcasts.podcasts;

		if (i >= podcasts.length) {
			const {maxRows, tilespan} = this.props;
			const limit = tilespan === 1 ? maxRows : 2 * maxRows;

			this.setState({
				podcasts: array.slice(0, limit)
			});
			return;
		}

		const podcast = podcasts[i];
		new Podcasts().getPodcasts(podcast.channel, podcast.option, podcast.value).then(this.onResponse.bind(this, podcast, array, i), this.fetchPodcasts.bind(this, array, i + 1));
	}

	onResponse(podcast, array, i, resp) {
		// prevent callback function firing after component has unmounted:
		if (this.componentHasUnmounted) return;

		if (resp) {
			if (resp.body.audio_clip) {
				const clip = resp.body.audio_clip;
				clip.loginRequired = podcast.mustBeLoggedIn;
				if (clip.urls && clip.channel)
					array.push(resp.body.audio_clip);
			}
			else if (resp.body.audio_clips) {
				const index = Math.min(podcast.mostRecent - 1, resp.body.audio_clips.length);
				const clip = resp.body.audio_clips[index];
				clip.loginRequired = podcast.mustBeLoggedIn;
				if (clip.urls && clip.channel)
					array.push(clip);
			}
			this.fetchPodcasts(array, i + 1);
		}
	}

	playSelectedMusic(src, podcastTitle, clipTitle, imageUrl) {
		App.Globals.audioBoom['url'] = src;
		App.Globals.audioBoom['imageUrl'] = imageUrl;
		App.Globals.audioBoom['podcastTitle'] = podcastTitle;
		App.Globals.audioBoom['clipTitle'] = clipTitle;
		App.Globals.audioBoom['playing'] = true;
		App.Globals.audioBoom['played'] = 0;

		App.bus.trigger(AUDIOBOOM_URL_CHANGED);
		this.setState({selectedUrl: src});
	}

	isLobby() {
		return (window.location.href.indexOf('/lobby') > -1);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		if (this.state.podcasts.length > 0) {
			const {tilespan} = this.props;
			const classNames = cx('audio-boom-table',this.isLobby()?'is-lobby':'');

			return (
				<Widget {...this.props}>
					<div className={classNames}>
						{tilespan === 1 ? this.renderSmallPodcasts() : this.renderLargePodcasts()}
					</div>
				</Widget>
			);
		} else {
			return null;
		}
	}

	renderSmallPodcasts() {
		const podcasts = this.state.podcasts;
		const rows = podcasts.map((data, index) => {
			return (
				<div className="table-row " key={index}>
					<div className="table-cell large no-hover">
						{this.renderLargePodcast(data)}
						{this.renderPermissionDiv(data)}
					</div>
				</div>
			);
		});
		return rows;
	}


	renderLargePodcasts() {
		const podcasts = this.state.podcasts;
		const rows = podcasts.map((data, index) => {
			if (index % 2 === 0 && (index + 1) < podcasts.length) {
				return (
					<div className="table-row " key={index}>
						<div className="table-cell large no-hover">
							{this.renderLargePodcast(data)}
							{this.renderPermissionDiv(data)}
						</div>
						<div className="table-cell large no-hover">
							{this.renderLargePodcast(podcasts[index + 1])}
							{this.renderPermissionDiv(podcasts[index + 1])}
						</div>
					</div>
				);
			} else if (podcasts.length === 1 || (podcasts.length % 2 === 1 && (index + 1) === podcasts.length)) {
				return (
					<div className="table-row" key={index}>
						<div className="table-cell large no-hover">
							{this.renderLargePodcast(data)}
							{this.renderPermissionDiv(data)}
						</div>
						<div className="table-cell large no-hover">
						</div>
					</div>
				);
			}
		});
		return rows;
	}

	renderLargePodcast(data) {
		const imageUrl = data.urls.image;
		const style = {backgroundImage: `url(${imageUrl + "/600x600"})`};
		return (

			<div>
				<div className="sub-cell left no-hover">
					<p className="episode-title">{data.title || ' '}</p>
					<p className="podcast-title u-margin--none u-fade">{data.channel.title || ' '}</p>
					{this.renderPlayButton(data.urls.high_mp3, data.channel.title, data.title, data.urls.image)}
				</div>
				<div className="sub-cell image no-hover" style={style}>
					{/*<p>Related Markets</p>*/}
				</div>
			</div>
		);
	}

	renderPlayButton(url, podcastTitle, clipTitle, imageUrl) {
		if (App.Globals.audioBoom['url'] && url === App.Globals.audioBoom['url'])
			return (
				<a className="c-btn--tertiary--podcast-control listen-button pressed" onClick={this.playSelectedMusic.bind(this,'', '', '', '')}>
					Playing <span className="g-control-icon g-control-icon--stop u-float-right"></span></a>
			);
		else
			return (
				<a className="c-btn--tertiary--podcast-control"
				   onClick={this.playSelectedMusic.bind(this,url, podcastTitle, clipTitle, imageUrl)}>Listen Now
					 <span className="g-control-icon g-control-icon--play u-float-right"></span></a>
			);
	}

	renderPermissionDiv(data) {
		if (this.state.loggedIn || !data.loginRequired)
			return null;

		return (
			<div className="no-permission">
				<p>Must be logged in to see this content</p>
			</div>
		);
	}


};
