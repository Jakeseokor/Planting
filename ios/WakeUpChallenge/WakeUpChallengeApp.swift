import SwiftUI
import UserNotifications

@main
struct WakeUpChallengeApp: App {
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var store = AlarmStore.shared

    init() {
        // 알림 delegate는 약한 참조이므로 싱글턴으로 강하게 보관
        UNUserNotificationCenter.current().delegate = AlarmNotificationDelegate.shared
    }

    var body: some Scene {
        WindowGroup {
            AlarmListView()
                .environmentObject(store)
                .task {
                    _ = await NotificationScheduler.requestAuthorization()
                    store.reschedule()
                }
                .onChange(of: scenePhase) { _, phase in
                    if phase == .active {
                        store.checkRinging()
                        store.reschedule()   // 7일 예약 창을 매일 갱신
                    }
                }
                .onReceive(Timer.publish(every: 5, on: .main, in: .common).autoconnect()) { _ in
                    store.checkRinging()
                }
                .fullScreenCover(isPresented: Binding(
                    get: { store.ringingAlarmID != nil },
                    set: { if !$0 { store.ringingAlarmID = nil } }
                )) {
                    RingingView()
                        .environmentObject(store)
                }
        }
    }
}
