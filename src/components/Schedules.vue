<template>
    <div class="schedule-container" :style="{gridTemplateColumns: 'repeat(' + schedules.length + ', 1fr)', marginBottom: $vuetify.breakpoint.mdAndUp ? '4em' : '3em', height: $vuetify.breakpoint.mdAndUp ? 'calc(100vh - 64px - 6rem)' : 'calc(100vh - 36px - 6rem)'}">
        <div class="current-time" :style="{top: currentTimeHeight()}"></div>
        <div v-for="(room, i) in schedules" :key="i" :style="{gridColumn: i + 1}" class="room">
            <div class="room-heading" :style="{
                backgroundColor: room.room.backgroundColor,
                color: invertColor(room.room.backgroundColor),
            }">
                {{room.room.summary}}
            </div>
            <div class="room-availability" :style="{fontSize: $vuetify.breakpoint.mdAndUp ? '1.5em' : '1em', height: $vuetify.breakpoint.mdAndUp ? '4em' : '3em' }">
                <div class="room-status" :style="{
                    backgroundColor: roomTaken(room) ? '#ff0000' : '#008000',
                    color: invertColor(roomTaken(room) ? '#ff0000' : '#008000'),
                }">
                    <div>Now</div>
                    <div v-if="$vuetify.breakpoint.mdAndUp">{{ roomTaken(room) ? 'Taken' : 'Free'}}</div>
                </div>
                <div class="room-status" :style="{
                    backgroundColor: roomTaken(room, 30) ? '#ff0000' : '#008000',
                    color: invertColor(roomTaken(room, 30) ? '#ff0000' : '#008000'),
                }">
                    <div>30 Min</div>
                    <div v-if="$vuetify.breakpoint.mdAndUp">{{ roomTaken(room, 30) ? 'Taken' : 'Free'}}</div>
                </div>
                <div class="room-status" :style="{
                    backgroundColor: roomTaken(room, 60) ? '#ff0000' : '#008000',
                    color: invertColor(roomTaken(room, 60) ? '#ff0000' : '#008000'),
                }">
                    <div>1 hr</div>
                    <div v-if="$vuetify.breakpoint.mdAndUp">{{ roomTaken(room, 60) ? 'Taken' : 'Free'}}</div>
                </div>

            </div>
            <div v-for="(event, eI) in room.schedule" :key="eI" class="event" :style="{
                top: eventTop(event),
                height: eventHeight(event),
                backgroundColor: room.room.backgroundColor,
                color: invertColor(room.room.backgroundColor),
                opacity: eventRunning(event) ? 1 : 0.6,
                width: eventWidth(event, room.schedule),
                left: eventLeft(event, room.schedule),
                flexDirection: $vuetify.breakpoint.mdAndUp ? null : 'row',
                justifyContent: $vuetify.breakpoint.mdAndUp ? null : 'space-between'
            }">
                <p class="event-summary">{{ event.visibility === 'private' ? 'Private' : event.summary }}</p>
                <div class="event-time" v-if="$vuetify.breakpoint.mdAndUp"> 
                    <p>{{ moment(event.start.dateTime).calendar() }}</p>
                    <p> - </p>
                    <p>{{ moment(event.end.dateTime).calendar() }}</p>
                </div>
                <p class="event-duration" v-else>
                    {{ eventDuration(event) }}
                </p>                
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import invertColor from '../colorInvert';

export default {
    data() {
        return {
            // dayStart: this.moment().subtract(2, 'hours').valueOf(),
            // dayEnd: this.moment().add(6, 'hours').valueOf(),
            dayStart: new Date().setHours(8, 0, 0, 0),
            dayEnd: new Date().setHours(18, 0, 0, 0),
            eventsGroupTallie: {},
        }
    },
    computed: {
        dayLength() {
            return this.dayEnd - this.dayStart;
        }
    },
    props: [
        'schedules',
        'currentUnixTime'
    ],
    methods: {
        moment(args) {
            return moment(args);
        },
        eventDuration(event) {
            return moment.duration(moment(event.end.dateTime).diff(moment(event.start.dateTime))).humanize()
        },
        eventTop(event) {
            const eventStart = new Date(event.start.dateTime).getTime();
            const eventTopPercent = ((eventStart - this.dayStart) / this.dayLength) * 100;

            return `${eventTopPercent}%`
        },
        eventHeight(event) {
            const eventStart = new Date(event.start.dateTime).getTime();
            const eventEnd = new Date(event.end.dateTime).getTime();

            const eventHeightPercent = ((eventEnd - eventStart) / this.dayLength) * 100;

            return `${eventHeightPercent}%`
        },
        eventRunning(event) {
            let start = moment(event.start.dateTime);
            let end = moment(event.end.dateTime);
            return moment().isBetween(start, end);
        },
        eventsDuringGivenEvent(event, events) {
            let count = 0;
            events.forEach(otherEvent => {
                let otherStart = moment(otherEvent.start.dateTime);
                let otherEnd = moment(otherEvent.end.dateTime);
                let start = moment(event.start.dateTime);
                let end = moment(event.end.dateTime);

                if (start.isBetween(otherStart, otherEnd, null, '[)') || end.isBetween(otherStart, otherEnd, null, '(]')) {
                    count += 1;
                }
            })
            return count;
        },
        eventWidth(event, events) {
            return `${100 / this.eventsDuringGivenEvent(event, events)}%`;
        },
        eventLeft(event, events) {
            let concurrent = this.eventsDuringGivenEvent(event, events);

            const group = [];

            events.forEach((otherEvent, otherEventIndex) => {
                let otherStart = moment(otherEvent.start.dateTime);
                let otherEnd = moment(otherEvent.end.dateTime);
                let start = moment(event.start.dateTime);
                let end = moment(event.end.dateTime);


                // if (start.isSameOrAfter(otherStart) && start.isBefore(otherEnd))
                if (start.isBetween(otherStart, otherEnd, null, '[)') || end.isBetween(otherStart, otherEnd, null, '(]')) {
                    group.push(otherEvent);
                }
            })

            let index = group.findIndex(e => {
                return e === event;
            })

            index += 1;

            return `${100 - ((100 / group.length) * index)}%`;
        },
        invertColor(color, bw = true) {
            return invertColor(color, bw);
        },
        roomTaken(room, offset = 0) {
            return room.schedule.find(event => {
                let start = moment(event.start.dateTime);
                let end = moment(event.end.dateTime);
                return moment().add(offset, 'minutes').isBetween(start, end);
            })
        },
        currentTimeHeight() {
            const timeTopPercent = ((new Date().getTime() - this.dayStart) / this.dayLength) * 100;

            return `${timeTopPercent}%`
        },
    },
    mounted() {
        // Updates every 5 seconds to move time sensitive items
        setInterval(() => {
            this.$forceUpdate();
        }, 5000)
    }
};
</script>

<style>
.schedule-container {
    height: calc(100vh - 64px - 6rem);
    width: 100%;
    box-sizing: border-box;
    padding: 3px;
    display: grid;
    margin-top: 2rem;
    margin-bottom: 4rem;
    position: relative;
}

.room {
    position: relative;
    font-size: 0.9em;
}

.room-heading {
    position: absolute;
    top: 0;
    line-height: 2rem;
    width: 100%;
    font-size: 1.75em;
    text-align: center;
    top: -2rem;
    border-left: 1px solid #303030;
    border-right: 1px solid #303030;
    z-index: 2000;
}

.room-availability {
    position: absolute;
    height: 4rem;
    width: 100%;
    font-size: 1.5em;
    text-align: center;
    top: 100%;
    display: flex;
}

.room-status {
    width: 100%;
    border-left: 1px solid #303030;
    border-right: 1px solid #303030;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.room-status div {
    display: flex;
    flex-direction: column;
}

.current-time {
    height: 1px;
    width: 100%;
    position: absolute;
    z-index: 1000;
    border: 1px dashed #57c2b2;
}

.event {
    position: absolute;
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 0.25em;
    border: 1px solid #303030;
    overflow: hidden;
    /* justify-content: center; */
    /* align-items: center; */
}

.event p {
    margin: 0;
}

.event-summary {
    font-weight: bold;
    width: 100%;    
}

.event-duration {
    width: 100%;
    text-align: right;
}

.event-time {
    display: flex;
    width: 100%;
}
</style>
