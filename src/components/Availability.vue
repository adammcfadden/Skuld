<template>
  <div class="availability-container">
    <div class="form-card">
      <h5>Schedule Check</h5>
      <p>
        Select the start date, end date, and times that you wish to search between.
        This tool will look for availability between the times you provided on
        all of the dates that you have given. You can also designate a timeslot
        length in minutes, and will be shown results that are at least as long
        as the timeslot you specified.
      </p>
    </div>
    <div class="form-container form-card">
      <div class="form-section">
        <v-menu
          lazy
          :close-on-content-click="false"
          v-model="startDateMenu"
          transition="scale-transition"
          class="input-size"
        >
          <v-text-field
            slot="activator"
            label="Start Date"
            v-model="startDate"
            append-icon="event"
            readonly
          ></v-text-field>
          <v-date-picker dark v-model="startDate" :allowed-dates="allowedStartDate"></v-date-picker>
        </v-menu>

        <v-menu
          lazy
          :close-on-content-click="false"
          v-model="startTimeMenu"
          transition="scale-transition"
          class="input-size"
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
          class="input-size"
        >
          <v-text-field
            slot="activator"
            label="End Date"
            v-model="endDate"
            append-icon="event"
            readonly
          ></v-text-field>
          <v-date-picker dark v-model="endDate" :allowed-dates="allowedEndDate"></v-date-picker>
        </v-menu>

        <v-menu
          lazy
          :close-on-content-click="false"
          v-model="endTimeMenu"
          transition="scale-transition"
          class="input-size"
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
        <v-checkbox label="Include Weekends?" v-model="includeWeekend"></v-checkbox>
        <!-- <v-checkbox label="Show Past Availability?" v-model="pastAvailability"></v-checkbox> -->
        <div class="input-size">
          <v-text-field
            label="Timeslot Length"
            v-model="timeNeeded"
            type="number"
            suffix="Minutes"
            step="15"
          >
          </v-text-field>
        </div>
      </div>
    </div>
    <div class="form-card results" v-if="availableTimes && availableTimes.length > 0">
      <v-btn class="copy-icon" id="copy-button" flat icon color="red" data-clipboard-action="copy" data-clipboard-target="#results">
        <v-icon dark>content_copy</v-icon>
      </v-btn>

      <div id="results">
        I have {{ timeNeededAsText }} of availability at these times.
          <div v-for="(day, dayIndex) in availableTimes" :key="dayIndex" v-if="day && day.length > 0">
            {{ moment(day[0].start).format('dddd MMM Do') }}
            <div v-for="(slot, index) in day" :key="index">
              > {{ moment(slot.start).format('h:mmA') }} - {{ moment(slot.end).format('h:mmA') }}
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import Clipboard from 'clipboard';

export default {
  data() {
    return {
      startTimeMenu: false,
      startDateMenu: false,
      endTimeMenu: false,
      endDateMenu: false,
      startDate: moment().startOf('day').format('YYYY-MM-DD'),
      startTime: '8:00am',
      endDate: moment().endOf('day').format('YYYY-MM-DD'),
      endTime: moment().hour(18).minute(0).format('h:mma'),
      timeNeeded: 30,
      includeWeekend: false,
      showTooltip: false,
      // pastAvailability: false,
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
      if(moment(this.startDate) > moment(this.endDate)) { return [] }

      const groupByDate = (startTimes, endTimes) => {
        let currentDate = this.startDate;

        const days = moment(this.end).diff(moment(this.start), 'days')
        const groupedEvents = [];

        for(let i=-1; i < days; i++) {
          let dayStart = moment(`${currentDate} ${this.startTime}`, 'YYYY-MM-DD h:mma').format('YYYY-MM-DDTHH:mm:ssZ');
          const dayEnd = moment(`${currentDate} ${this.endTime}`, 'YYYY-MM-DD h:mma').format('YYYY-MM-DDTHH:mm:ssZ');
          const currentEvents = {
            startTimes: [],
            endTimes: [],
          };

          if(moment(`${currentDate} ${this.startTime}`, 'YYYY-MM-DD h:mma').isBefore(moment())) {
            let time = moment();
            let diff = time.minutes() / 15;
            if ( diff < 1 ) {
              time.add(15 - time.minutes(), 'minutes');
            } else {
              time.add( Math.round((Math.ceil(diff) - diff) * 15), 'minutes' );
            }
            dayStart = time.format('YYYY-MM-DDTHH:mm:ssZ');
          }

          // Push on the beginning of the day first
          currentEvents.endTimes.push(dayStart);

          endTimes.forEach(time => {
            if(moment(time).isBetween(moment(dayStart), moment(dayEnd), null, '[]')) {
              currentEvents.endTimes.push(time)
            }
          })
          startTimes.forEach(time => {
            if(moment(time).isBetween(moment(dayStart), moment(dayEnd), null, '[]')) {
              currentEvents.startTimes.push(time)
            }
          })

          // Push on the end of the day last
          currentEvents.startTimes.push(dayEnd);

          groupedEvents.push(currentEvents);

          currentDate = moment(currentDate).add(1, 'day').format('YYYY-MM-DD')
        }

        return groupedEvents
      };

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

      endTimes.sort((a, b) => {
        if (moment(a).diff(moment(b)) > 0) {
          return 1;
        }
        return -1;
      })

      const groupedEvents = groupByDate(startTimes, endTimes);
      // Availability will contain an array of possible meeting times
      let availability = [];

      groupedEvents.forEach(day => {
        const _endTimes = day.endTimes;
        const _startTimes = day.startTimes;

        let slotsInDay = []

        _endTimes.forEach((endtime, index) => {
          if(!endtime) { return }

          slotsInDay.push({
            start: endtime,
            end: _startTimes[index],
            diff: -moment(endtime).diff(_startTimes[index], 'minutes')
          })
        })
        // Filter out any timeslots that aren't big enough
        slotsInDay = slotsInDay.filter(slot => slot.diff >= this.timeNeededInt);

        // Filter out all the weekend results if they don't want weekend being shown
        if(!this.includeWeekend) {
          slotsInDay = slotsInDay.filter(slot => moment(slot.start).format('dd') != 'Su' && moment(slot.start).format('dd') != 'Sa');
        }

        // Filter out all the past results if they don't want the past shown
        // if(!this.pastAvailability) {
        //   slotsInDay = slotsInDay.filter(slot => moment(slot.start).isAfter(moment()));
        // }



        availability.push(slotsInDay);
      })
      return availability;
    }
  },
  asyncComputed: {
    schedule: {
      get() {
        return window.gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'maxResults': 2500,
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
  mounted() {
    new Clipboard('#copy-button');
  },
  methods: {
    allowedStartDate(date) {
      return moment(date).isAfter(moment().startOf('day'))
    },
    allowedEndDate(date) {
      return moment(date).isAfter(moment(this.startDate).startOf('day'))
    },
    moment(args) {
      return moment(args);
    },
    duration() {
      return moment.duration.apply(this, arguments);
    },
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
.form-card {
  width: 85%;
  background: #424242;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px rgba(0,0,0,0.14), 0 1px 10px rgba(0,0,0,0.12);
  margin-top: 2em;
  padding: 1em 15%;
  box-sizing: border-box;
  position: relative;
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
  width: 100%;
}
.card {
  box-shadow: none !important;
}
.copy-icon {
  position: absolute;
  top: 1em;
  right: 1em;
}
.input-size {
  width: 290px;
}
</style>
<style>
.menu__content {
  box-shadow: none !important;
}
</style>
