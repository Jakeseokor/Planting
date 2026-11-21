import Foundation
import CoreLocation

/// 사진 미션에서 사용하는 지정 장소 좌표
struct GeoPoint: Codable, Hashable {
    var latitude: Double
    var longitude: Double

    var clLocation: CLLocation {
        CLLocation(latitude: latitude, longitude: longitude)
    }
}

/// 알람을 끄기 위해 수행해야 하는 미션 종류
enum ChallengeKind: Codable, Hashable {
    case math(problems: Int)
    case shake(count: Int)
    case typing(phrase: String)
    case photo
    case steps(count: Int)

    var title: String {
        switch self {
        case .math(let n): return "수학 문제 \(n)개"
        case .shake(let n): return "폰 흔들기 \(n)회"
        case .typing(let p): return "따라쓰기: \(p)"
        case .photo: return "지정 장소 사진 촬영"
        case .steps(let n): return "걸음 \(n)보"
        }
    }
}

struct ChallengeItem: Codable, Identifiable, Hashable {
    var id = UUID()
    var kind: ChallengeKind
}

struct Alarm: Codable, Identifiable, Hashable {
    var id = UUID()
    var label = "기상 알람"
    var hour = 7
    var minute = 0
    /// Calendar 기준 요일 (1 = 일요일 ... 7 = 토요일)
    var weekdays: Set<Int> = [2, 3, 4, 5, 6]
    var isEnabled = true
    /// 순서대로 모두 완료해야 알람이 꺼짐
    var challenges: [ChallengeItem] = [ChallengeItem(kind: .math(problems: 3))]
    /// 사진 미션에서 사용할 장소 (nil이면 사진만 찍으면 통과)
    var place: GeoPoint? = nil
    var placeRadius: Double = 100
    /// 오늘 미션을 완료한 날짜 (해당 날짜의 알람은 다시 울리지 않음)
    var lastCompletedDay: Date? = nil
}
