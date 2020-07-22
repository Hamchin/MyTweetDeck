import React, { Component } from 'react';
import Sidebar from './Sidebar';
import Timeline from './Timeline';
import TweetModal from './TweetModal';
import RetweetModal from './RetweetModal';
import MediaModal from './MediaModal';
import AddTimelineModal from './AddTimelineModal';
import SettingModal from './SettingModal';
import Alert from './Alert';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timelines: [],
            notices: [],
            modal: {},
            setting: {
                likeByClickTweetPanel: false,
                resetScrollByClickOuter: false
            }
        };
        this.updateState = (state, callback = () => {}) => {
            this.setState(state, callback);
        }
        this.updateTimeline = (idx) => {
            const timeline = this.state.timelines[idx];
            let tweets = timeline.defaultTweets.concat();
            if (timeline.setting.sortByLikedCount) {
                tweets.sort((a, b) => (b.favorite_count - a.favorite_count));
            }
            if (timeline.setting.trimLikedTweet) {
                tweets = tweets.filter((tweet) => (!tweet.favorited));
            }
            if (timeline.setting.showMediaTweet) {
                tweets = tweets.filter((tweet) => (tweet.media_links.length || tweet.video_link));
            }
            if (timeline.setting.makeUserUnique) {
                tweets = tweets.filter((tweet, i, tweets) => (
                    tweets.map(tweet => tweet.user.id_str).indexOf(tweet.user.id_str) === i
                ));
            }
            timeline.tweets = tweets;
            this.setTimeline(idx, timeline);
        }
        this.loadTimeline = (idx) => {
            const timeline = this.state.timelines[idx];
            timeline.load = true;
            this.setTimeline(idx, timeline);
            $.ajax({
                url: timeline.url,
                dataType: "json"
            })
            .then(
                data => {
                    const defaultTweets = data.tweets;
                    if (defaultTweets.length === 0) {
                        this.addNotice("danger", "Load failed.");
                    }
                    else {
                        const tweetIDs = timeline.defaultTweets.map(tweet => tweet.id_str);
                        defaultTweets.forEach((tweet, i) => {
                            defaultTweets[i].new = tweetIDs.includes(tweet.id_str) ? false : true;
                        });
                    }
                    timeline.defaultTweets = defaultTweets;
                    timeline.load = false;
                    idx = this.state.timelines.findIndex(child => timeline.id === child.id);
                    this.setTimeline(idx, timeline);
                    this.updateTimeline(idx);
                },
                error => console.error(error)
            );
            $(".timeline-container").css("width", 280 * this.state.timelines.length);
        }
        this.setTimeline = (timelineIndex, timeline) => {
            const timelines = this.state.timelines;
            timelines[timelineIndex] = timeline;
            this.setState({timelines: timelines});
        }
        this.saveTimelineState = () => {
            const timelines = this.state.timelines.map(timeline => {
                const { id, name, url, icon, setting } = timeline;
                return { id, name, url, icon, setting };
            });
            $.ajax({
                url: "/api/timelines",
                dataType: "json",
                type: "POST",
                data: {timelines: JSON.stringify(timelines)}
            });
        }
        this.setTweet = (timelineIndex, tweetIndex, tweet) => {
            const timelines = this.state.timelines;
            timelines[timelineIndex][tweetIndex] = tweet;
            this.setState({timelines: timelines});
        }
        this.addTimeline = (id, name, url, icon) => {
            const timelines = this.state.timelines;
            if (timelines.find(timeline => id === timeline.id)) return;
            const timeline = this.createTimeline(id, name, url, icon);
            timelines.push(timeline);
            this.setState({timelines: timelines}, () => {
                this.loadTimeline(timelines.length - 1);
                this.saveTimelineState();
            });
        }
        this.removeTimeline = (id) => {
            const timelines = this.state.timelines;
            this.setState({
                timelines: timelines.filter(timeline => id !== timeline.id)
            }, () => {
                this.saveTimelineState();
                $(".timeline-container").css("width", 280 * this.state.timelines.length);
            });
        }
        this.createTimeline = (id, name, url, icon) => ({
            id: id,
            name: name,
            url: url,
            icon: icon,
            load: false,
            defaultTweets: [],
            tweets: [],
            setting: {
                sortByLikedCount: false,
                trimLikedTweet: false,
                showMediaTweet: false,
                makeUserUnique: false
            }
        });
        this.addNotice = (status, text) => {
            let notices = this.state.notices;
            if (!notices.find(notice => notice.display)) notices = [];
            if (notices.length >= 10) notices = [];
            this.setState({notices: notices});
            notices.push({status: status, text: text, display: true});
            const idx = notices.length - 1;
            this.setState({notices: notices});
            setTimeout(() => {
                const notices = this.state.notices;
                notices[idx].display = false;
                this.setState({notices: notices});
            }, 3000);
        }
        this.handleClick = (e) => {
            if (e.target !== e.currentTarget) return;
            if (!this.state.setting.resetScrollByClickOuter) return;
            $(".tweet-container").each((_, container) => {
                $(container).scrollTop(0);
            });
        }
        this.action = {
            updateState: this.updateState,
            updateTimeline: this.updateTimeline,
            loadTimeline: this.loadTimeline,
            setTimeline: this.setTimeline,
            addTimeline: this.addTimeline,
            removeTimeline: this.removeTimeline,
            createTimeline: this.createTimeline,
            saveTimelineState: this.saveTimelineState,
            setTweet: this.setTweet,
            addNotice: this.addNotice
        };
    }
    componentDidMount() {
        $.ajax({
            url: "/api/timelines",
            dataType: "json"
        })
        .then(
            data => {
                const timelines = data.timelines.map(data => {
                    const { id, name, url, icon, setting } = data;
                    const timeline = this.createTimeline(id, name, url, icon);
                    timeline.setting = setting;
                    return timeline;
                });
                if (timelines.length === 0) {
                    timelines.push(this.createTimeline("HOME", "Home", "/api/home_timeline", "fas fa-home"));
                    timelines.push(this.createTimeline("KAWAII", "Kawaii", "/api/kawaii", "fas fa-grin-hearts"));
                }
                this.setState({timelines: timelines}, () => {
                    this.state.timelines.forEach((_, idx) => this.loadTimeline(idx));
                });
            },
            error => console.error(error)
        );
        $.ajax({
            url: "/api/log",
            dataType: "json",
            type: "POST",
            data: {status: "Access to MyTweetDeck"}
        });
    }
    render() {
        return (
            <div onClick={this.handleClick}>
                <Sidebar action={this.action} timelines={this.state.timelines} />
                <ul className="timeline-container">
                    {this.state.timelines.map((timeline, idx) => {
                        return <Timeline key={timeline.id} timeline={timeline} timelineIndex={idx} setting={this.state.setting} action={this.action} />;
                    })}
                </ul>
                <TweetModal action={this.action} />
                <RetweetModal modal={this.state.modal} action={this.action} />
                <MediaModal modal={this.state.modal} />
                <AddTimelineModal timelines={this.state.timelines} action={this.action} />
                <SettingModal setting={this.state.setting} action={this.action} />
                <div className="notice-container">
                    {this.state.notices.map((notice, idx) => <Alert notice={notice} key={idx} />)}
                </div>
            </div>
        );
    }
}