# Acceptance Criteria

## AC-001

- 관련 요구사항: REQ-PROD-001
- 관련 화면: SCR-01
- Given: 방장이 새 약속방을 만들 때
- When: 모임명과 후보 시간 2개 이상을 입력하고 `초대 링크 만들기`를 누르면
- Then: 공유 가능한 약속방 링크와 참여자 입력 화면이 생성됩니다.
- 검증 방법: 생성 flow UI test.
- 실패 조건: 후보 시간이 0~1개인데 링크가 생성됨.

## AC-002

- 관련 요구사항: REQ-PROD-002
- 관련 화면: SCR-02
- Given: 참여자가 초대 링크에 접근했을 때
- When: 각 후보에 선호/가능/조정 가능/강한 불가 중 하나를 선택하고 제출하면
- Then: 응답이 저장되고 완료 상태가 표시됩니다.
- 검증 방법: form submission test.
- 실패 조건: 선택 누락을 저장하거나 완료 표시가 없음.

## AC-003

- 관련 요구사항: REQ-LOGIC-001
- 관련 화면: SCR-03
- Given: 후보별 응답이 모였을 때
- When: 전원 가능 시간이 없는 경우
- Then: 시스템은 가능/선호/조정 가능/강한 불가를 집계해 후보 1~2개를 순위와 이유로 표시합니다.
- 검증 방법: deterministic fixture scoring test.
- 실패 조건: hard-no가 많은 후보가 설명 없이 1순위가 됨.

## AC-004

- 관련 요구사항: REQ-COPY-001
- 관련 화면: SCR-03
- Given: 추천 후보가 표시되었을 때
- When: 방장이 공유 문구를 확인하면
- Then: 특정 참여자 이름/불가 사유 없이 집계형 이유와 완충 문구가 포함됩니다.
- 검증 방법: copy snapshot test and manual review.
- 실패 조건: “A님 때문에” 같은 특정인 책임 문구가 포함됨.

## AC-005

- 관련 요구사항: REQ-UX-001
- 관련 화면: SCR-04
- Given: 응답이 최소 기준보다 부족할 때
- When: 방장이 결과 화면을 열면
- Then: 추천을 단정하지 않고 응답 요청/후보 재설정 action을 표시합니다.
- 검증 방법: insufficient-response fixture test.
- 실패 조건: 응답 부족인데 확정 추천을 표시함.

## AC-006

- 관련 요구사항: REQ-UI-001
- 관련 화면: SCR-01, SCR-02, SCR-03, SCR-04
- Given: 모바일 390px viewport
- When: 각 화면을 열면
- Then: primary action은 접힘 없이 보이고 touch target은 44px 이상입니다.
- 검증 방법: responsive visual check.
- 실패 조건: 주요 버튼이 가려지거나 44px 미만.

## AC-007

- 관련 요구사항: REQ-COPY-001
- 관련 화면: SCR-03
- Given: 방장이 `문구 복사하기`를 누를 때
- When: copy action이 성공하면
- Then: copied 상태와 동일 문구 preview가 유지됩니다.
- 검증 방법: clipboard/mock action test.
- 실패 조건: 복사된 문구가 preview와 다름.

## AC-008

- 관련 요구사항: REQ-LOGIC-001
- 관련 화면: SCR-03
- Given: 모든 후보에 강한 불가가 과다할 때
- When: 결과를 계산하면
- Then: 추천 확신도를 낮추고 후보 재설정 안내를 보여줍니다.
- 검증 방법: all-hard-no fixture test.
- 실패 조건: “최적안”으로 단정.

## AC-009

- 관련 요구사항: REQ-PROD-002
- 관련 화면: SCR-02
- Given: 만료된 링크로 접근했을 때
- When: 참여자가 입력을 시도하면
- Then: 입력 저장을 막고 방장에게 새 링크를 요청하라는 메시지를 보여줍니다.
- 검증 방법: expired-room route test.
- 실패 조건: 만료 링크가 응답을 저장함.

## AC-010

- 관련 요구사항: REQ-UX-001, REQ-COPY-001
- 관련 화면: SCR-04
- Given: 응답 부족 상태
- When: 방장이 응답 요청 문구를 복사하면
- Then: 압박 없이 “빠르게 체크 부탁” 수준의 관계 안전 문구가 복사됩니다.
- 검증 방법: copy snapshot test.
- 실패 조건: 미응답자를 특정하거나 압박하는 문구.
