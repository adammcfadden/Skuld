<template>
  <v-app dark v-if="ready">
    <v-navigation-drawer persistent :mini-variant="miniVariant" :clipped="clipped" v-model="drawer" enable-resize-watcher>
      <v-list v-if="rooms">
        <v-list-tile @click="toggleRoomSelected(room)" :style="{backgroundColor: room.backgroundColor, color: invertColor(room.backgroundColor)}" value="true" v-for="(room, i) in rooms" :key="i">
          <v-list-tile-action>
            <span>{{room.summary.substr(0,1)}}</span>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="room.summary"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed>
      <v-toolbar-side-icon @click.stop="drawer = !drawer" dark></v-toolbar-side-icon>
      <v-btn v-if="drawer" icon dark @click.stop="miniVariant = !miniVariant">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <div style="font-size: 1.5em">
        {{ date }}
      </div>
      <v-spacer></v-spacer>
      <clock class="hidden-sm-and-down"></clock>
      <v-spacer></v-spacer>
      <!--Add buttons to initiate auth sequence and sign out-->
      <v-btn ref="signoutButton" @click="handleSignoutClick" id="signout-button" dark v-if="isSignedIn">Sign Out</v-btn>
      <v-btn ref="authorizeButton" @click="handleAuthClick" id="authorize-button" dark v-else>Authorize</v-btn>
    </v-toolbar>
    <main>
      <v-slide-y-transition mode="out-in">
        <schedules :schedules="schedules" :currentUnixTime="currentUnixTime"></schedules>
      </v-slide-y-transition>
    </main>
  </v-app>
</template>

<script>
import moment from 'moment';

import Schedules from './components/Schedules';
import Clock from './components/Clock';
import invertColor from './colorInvert';
import './main.css';


// Client ID and API key from the Developer Console
const CLIENT_ID = '1038995557573-cre796lpfvffqrcirdd9elka3evbapl8.apps.googleusercontent.com';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

const UPDATE_INTERVAL = 30000;

export default {
  data() {
    return {
      ready: false,
      clipped: true,
      drawer: true,
      fixed: false,
      miniVariant: false,
      date: moment().format("MMMM Do YYYY"),
      title: '',
      selectedRooms: this.loadSelectedRooms(),
      schedules: [],
      isSignedIn: false,
      gapiClient: undefined,
      currentUnixTime: new Date().getTime(),
      loadFromCache: true,
    };
  },
  asyncComputed: {
    rooms: {
      get() {
        if (!this.isSignedIn) { return []; }

        return window.gapi.client.calendar.calendarList.list({
          'maxResults': 250,
        }).then(function(response) {
          let _rooms = response.result.items.filter(item => {
            return item.id.includes('resource');
          })

          _rooms.sort((a, b) => {
            if (a.summary < b.summary) return -1;
            if (a.summary > b.summary) return 1;
            return 0;
          })

          return _rooms;
        });

      },
      default: [],
      lazy: true,
    }
  },
  components: {
    Schedules,
    Clock,
  },
  methods: {
    loadSelectedRooms() {
      let rooms = localStorage.getItem('selected-rooms')
      if (!rooms) { return [] };

      return JSON.parse(rooms);
    },
    updateRoomSchedules() {
      let newSchedules = [];
      let updateCount = this.selectedRooms.length;

      const start = new Date();
      start.setHours(7, 0, 0, 0);
      const end = new Date();
      end.setHours(19, 0, 0, 0);
      // const start = moment().subtract(2, 'hours')
      // const end = moment().add(6, 'hours')

      this.selectedRooms.forEach(room => {
        window.gapi.client.calendar.events.list({
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 250,
          orderBy: 'startTime',
          calendarId: room.id
        }).then((response) => {
          const events = response.result.items

          updateCount -= 1

          newSchedules.push({
            room: room,
            schedule: events
          })

          if (updateCount === 0) {

            newSchedules.sort((a, b) => {
              if (a.room.summary < b.room.summary) return -1;
              if (a.room.summary > b.room.summary) return 1;
              return 0;
            })

            // update the property
            this.schedules = Array.from(newSchedules);
          }

          this.currentUnixTime = new Date().getTime();
        })
      })
    },
    toggleRoomSelected(room) {
      if (this.selectedRooms.findIndex(r => r.summary === room.summary) === -1) {
        this.selectedRooms.push(room);
      } else {
        this.selectedRooms = this.selectedRooms.filter(r => {
          return r.summary !== room.summary
        });
      }

      // Cache selected Rooms
      localStorage.setItem('selected-rooms', JSON.stringify(this.selectedRooms));

      if (this.selectedRooms.length > 0) {
        this.updateRoomSchedules();

        if (this.roomUpdateInterval) { clearInterval(this.roomUpdateInterval); }

        // Update rooms once a minute
        this.roomUpdateInterval = setInterval(() => {
          this.updateRoomSchedules();
        }, UPDATE_INTERVAL)
      }
    },
    handleClientLoad() {
      window.gapi.load('client:auth2', this.initClient);
    },

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    initClient() {
      window.gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
      }).then(() => {
        // Listen for sign-in state changes.
        window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

        // Handle the initial sign-in state.
        this.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());

        this.ready = true;
      });
    },

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    updateSigninStatus(isSignedIn) {
      if (isSignedIn) {
        this.isSignedIn = true;
      } else {
        this.isSignedIn = false;
      }
    },


    invertColor(color, bw = true) {
      return invertColor(color, bw);
    },


    /**
     *  Sign in the user upon button click.
     */
    handleAuthClick(event) {
      window.gapi.auth2.getAuthInstance().signIn();
      this.$forceUpdate();
    },

    /**
     *  Sign out the user upon button click.
     */
    handleSignoutClick(event) {
      window.gapi.auth2.getAuthInstance().signOut();
      localStorage.removeItem('selected-rooms');
      this.schedules = [];
      this.$forceUpdate();
    },
  },
  mounted() {
    this.handleClientLoad();
  },
  updated() {
    this.handleClientLoad();
    if (this.selectedRooms.length > 0 && this.loadFromCache) {
      this.updateRoomSchedules()

      this.roomUpdateInterval = setInterval(() => {
        this.updateRoomSchedules();
      }, UPDATE_INTERVAL)

      this.loadFromCache = false;
    }
  },
  beforeDestroy() {
    clearInterval(this.roomUpdateInterval);
  }
};
</script>

<style lang="stylus">
  @import './stylus/main'
</style>
