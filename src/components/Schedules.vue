<template>
    <div class="schedule-container" :style="{gridTemplateColumns: 'repeat(' + schedules.length + ', 1fr)'}">
        <div class="current-time" :style="{top: currentTimeHeight()}"></div>
        <div v-for="(room, i) in schedules" :key="i" :style="{gridColumn: i + 1}" class="room">
            <div class="room-heading" :style="{
                backgroundColor: room.room.backgroundColor,
                color: invertColor(room.room.backgroundColor),
            }">
                {{room.room.summary}}
            </div>
            <div class="room-availability" :style="{
                backgroundColor: roomTaken(room) ? '#ff0000' : '#008000',
                color: invertColor(roomTaken(room) ? '#ff0000' : '#008000'),
            }">{{ roomTaken(room) ? 'Taken' : 'Free'}}</div>
            <div v-for="(event, eI) in room.schedule" :key="eI" class="event" :style="{
                top: eventTop(event),
                height: eventHeight(event),
                backgroundColor: room.room.backgroundColor,
                color: invertColor(room.room.backgroundColor)
            }">
                <p class="event-summary">{{ event.visibility === 'private' ? 'Private' : event.summary }}</p>
                <div class="event-time">
                    <p>{{ moment(event.start.dateTime).calendar() }}</p>
                    <p> - </p>
                    <p>{{ moment(event.end.dateTime).calendar() }}</p>
                </div>
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
        invertColor(color, bw = true) {
            return invertColor(color, bw);
        },
        roomTaken(room) {
            return room.schedule.find(event => {
                let start = moment(event.start.dateTime);
                let end = moment(event.end.dateTime);
                return moment().isBetween(start, end);
            })
        },
        currentTimeHeight() {
            const timeTopPercent = ((new Date().getTime() - this.dayStart) / this.dayLength) * 100;

            return `${timeTopPercent}%`
        }
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
    height: calc(100vh - 64px - 4rem);
    width: 100%;
    box-sizing: border-box;
    padding: 3px;
    display: grid;
    margin-top: 2rem;
    margin-bottom: 2rem;
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
    font-size: 2em;
    text-align: center;
    top: -2rem;
    border: 1px solid #303030;
}

.room-availability {
    position: absolute;
    /* top: 0; */
    line-height: 2rem;
    width: 100%;
    font-size: 2em;
    text-align: center;
    bottom: -2rem;
    border: 1px solid #303030;
}

.current-time {
    height: 1px;
    width: 100%;
    position: absolute;
    z-index: 1000;
    border: 3px dashed white;
    opacity: 0.75;
}

.event {
    position: absolute;
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 0.25em;
    border: 1px solid #303030;
    /* justify-content: center; */
    /* align-items: center; */
}

.event p {
    margin: 0;
}

.event-summary {
    font-weight: bold;
}

.event-time {
    display: flex;
    width: 100%;
}
</style>
