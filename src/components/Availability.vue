<template>
  <div class="availability-container">
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
          prepend-icon="event"
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
          prepend-icon="access_time"
          readonly
        ></v-text-field>
        <v-time-picker dark v-model="startTime" autosave></v-time-picker>
      </v-menu>

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
          prepend-icon="event"
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
          prepend-icon="access_time"
          readonly
        ></v-text-field>
        <v-time-picker dark v-model="endTime" autosave></v-time-picker>
      </v-menu>

      <v-text-field
        label="Meeting Length"
        v-model="timeNeeded"
        type="number"
        suffix="Minutes"
        step="15"
      ></v-text-field>
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
    start() {
      return moment(`${this.startDate} ${this.startTime}`, 'YYYY-MM-DD h:mma').toISOString();
    },
    end() {
      return moment(`${this.endDate} ${this.endTime}`, 'YYYY-MM-DD h:mma').toISOString();
    },
    availableTimes() {
      let startTimes = this.schedule.map(evt => evt.start.dateTime);
      let endTimes = this.schedule.map(evt => evt.end.dateTime);

/// SORT ARRAYS HERE
      startTimes.sort((a, b) => {
        if ()
      })


      const availability = [];

      endTimes.forEach((endtime, index) => {
        if(!endtime) { return }
        availability.push({
          start: endtime,
          end: startTimes[index + 1],
          diff: -moment(endtime).diff(startTimes[index + 1], 'minutes')
        })
      })

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
  }
}
</script>

<style>
.availability-container {
  width: 100%;
}
</style>
