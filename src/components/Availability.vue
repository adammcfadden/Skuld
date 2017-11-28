<template>
  <div class="availability-container">
    <div class="form-container card">
      <div class="form-section">
        <v-menu
          lazy
          :close-on-content-click="false"
          v-model="startDateMenu"
          transition="scale-transition"
        >
          <v-text-field
            slot="activator"
            label="Start Date"
            v-model="startDate"
            append-icon="event"
            readonly
          ></v-text-field>
          <v-date-picker dark v-model="startDate"></v-date-picker>
        </v-menu>

        <v-menu
          lazy
          :close-on-content-click="false"
          v-model="startTimeMenu"
          transition="scale-transition"
        >
          <v-text-field
            slot="activator"
            label="Start Time"
            v-model="startTime"
            append-icon="access_time"
            readonly
          ></v-text-field>
          <v-time-picker dark v-model="startTime" autosave></v-time-picker>
        </v-menu>
      </div>
      <div class="form-section">
        <v-menu
          lazy
          :close-on-content-click="false"
          v-model="endDateMenu"
          transition="scale-transition"
        >
          <v-text-field
            slot="activator"
            label="End Date"
            v-model="endDate"
            append-icon="event"
            readonly
          ></v-text-field>
          <v-date-picker dark v-model="endDate"></v-date-picker>
        </v-menu>

        <v-menu
          lazy
          :close-on-content-click="false"
          v-model="endTimeMenu"
          transition="scale-transition"
        >
          <v-text-field
            slot="activator"
            label="End Time"
            v-model="endTime"
            append-icon="access_time"
            readonly
          ></v-text-field>
          <v-time-picker dark v-model="endTime" autosave></v-time-picker>
        </v-menu>
      </div>
      <div class="form-section">
        <v-text-field
          label="Meeting Length"
          v-model="timeNeeded"
          type="number"
          suffix="Minutes"
          step="15"
        >
        </v-text-field>
      </div>
    </div>
    <div class="card results">
      I have {{ timeNeededAsText }} of availability at these times.
      <ul>
        <li v-for="(slot, index) in availableTimes" :key="index">
          {{ moment(slot.start).format('dddd MMM Mo h:mmA') }} - {{ moment(slot.end).format('h:mmA') }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  data() {
    return {
      startTimeMenu: false,
      startDateMenu: false,
      endTimeMenu: false,
      endDateMenu: false,
      startDate: moment().startOf('day').format('YYYY-MM-DD'),
      startTime: moment().format('h:mma'),
      endDate: moment().endOf('day').format('YYYY-MM-DD'),
      endTime: moment().hour(18).minute(0).format('h:mma'),
      timeNeeded: 30,
    }
  },
  computed: {
    timeNeededAsText() {
      let hours = Math.floor(this.timeNeededInt / 60);
      let minutes = this.duration(this.timeNeededInt % 60, 'minutes').asMinutes();

      switch(true) {
        case (hours > 1 && minutes === 0):
          return `${hours} hours`
        case (hours === 1 && minutes === 0):
          return `${1} hour`
        case (hours > 1):
          return `${hours} hours and ${minutes} minutes`
        case (hours === 1):
          return `${hours} hour and ${minutes} minutes`
        default:
          return `${minutes} minutes`
      }
    },
    timeNeededInt() {
      return parseInt(this.timeNeeded);
    },
    start() {
      return moment(`${this.startDate} ${this.startTime}`, 'YYYY-MM-DD h:mma').toISOString();
    },
    end() {
      return moment(`${this.endDate} ${this.endTime}`, 'YYYY-MM-DD h:mma').toISOString();
    },
    /**
     * Will return an array of possible meeting times and update if the user changes selections
     */
    availableTimes() {
      if(!this.schedule) { return [] }

      let startTimes = this.schedule.map(evt => evt.start.dateTime);
      let endTimes = this.schedule.map(evt => evt.end.dateTime);

      // SORT ARRAYS HERE
      startTimes.sort((a, b) => {
        if (moment(a).diff(moment(b)) > 0) {
          return 1;
        }
        return -1;
      })
      // Add the final meeting cutoff time to start times to calculate against it
      startTimes.push(moment(`${this.endDate} ${this.endTime}`, 'YYYY-MM-DD h:mma').format('YYYY-MM-DDTHH:mm:ssZ'));

      endTimes.sort((a, b) => {
        if (moment(a).diff(moment(b)) > 0) {
          return 1;
        }
        return -1;
      })
      // Add the initial meeting start time to end times to calculate against it
      endTimes.unshift(moment(`${this.startDate} ${this.startTime}`, 'YYYY-MM-DD h:mma').format('YYYY-MM-DDTHH:mm:ssZ'));

      // Availability will contain an array of possible meeting times
      let availability = [];

      endTimes.forEach((endtime, index) => {
        if(!endtime) { return }

        availability.push({
          start: endtime,
          end: startTimes[index],
          diff: -moment(endtime).diff(startTimes[index], 'minutes')
        })
      })

      // Filter out any timeslots that aren't big enough
      availability = availability.filter(slot => slot.diff >= this.timeNeededInt);

      return availability;
    }
  },
  asyncComputed: {
    schedule: {
      get() {
        return window.gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'maxResults': 100,
          'timeMin': this.start,
          'timeMax': this.end,
          'showDeleted': false,
          'singleEvents': true,
          "orderBy": 'startTime',
        }).then((res) => {
          return JSON.parse(res.body).items;
        })
      }
    }
  },
  methods: {
    moment(args) {
      return moment(args);
    },
    duration() {
      return moment.duration.apply(this, arguments);
    }
  }
}
</script>

<style scoped>
.availability-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.card {
  width: 85%;
  background: #222324;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px rgba(0,0,0,0.14), 0 1px 10px rgba(0,0,0,0.12);
  margin-top: 2em;
}
.form-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.form-section {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 70%;
}
</style>
